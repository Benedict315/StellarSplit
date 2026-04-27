/**
 * Analytics cache service — NestJS-managed Redis lifecycle (#466).
 *
 * Replaces the module-global Redis client in analytics.cache.ts with an
 * injectable service that:
 *   - Creates the Redis connection inside `onModuleInit` (not at import time)
 *   - Gracefully closes the connection in `onModuleDestroy`
 *   - Supports health checks
 *   - Falls back gracefully when Redis is unavailable
 */
import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { PlatformMetrics } from './analytics.metrics';

const METRICS_KEY   = 'platform_metrics';
const METRICS_TTL_S = 10; // 10-second TTL for real-time freshness

@Injectable()
export class AnalyticsCacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AnalyticsCacheService.name);
  private redis: Redis | null = null;
  private available = false;

  constructor(private readonly configService: ConfigService) {}

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  async onModuleInit(): Promise<void> {
    const url = this.configService.get<string>('REDIS_URL', 'redis://localhost:6379');

    try {
      this.redis = new Redis(url, {
        lazyConnect: true,
        maxRetriesPerRequest: 2,
        connectTimeout: 5_000,
        enableOfflineQueue: false,
      });

      this.redis.on('error', (err) => {
        if (this.available) {
          this.logger.warn(`Redis connection error: ${err.message}`);
        }
        this.available = false;
      });

      this.redis.on('connect', () => {
        this.available = true;
        this.logger.log('Analytics Redis connected');
      });

      this.redis.on('close', () => {
        this.available = false;
      });

      await this.redis.connect();
    } catch (err) {
      this.logger.warn(
        `Analytics Redis unavailable — caching disabled. ${(err as Error).message}`,
      );
      this.available = false;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.redis) {
      await this.redis.quit().catch(() => this.redis?.disconnect());
      this.redis = null;
      this.available = false;
      this.logger.log('Analytics Redis connection closed');
    }
  }

  // ── Health ─────────────────────────────────────────────────────────────────

  isAvailable(): boolean {
    return this.available;
  }

  async ping(): Promise<boolean> {
    if (!this.redis || !this.available) return false;
    try {
      const pong = await this.redis.ping();
      return pong === 'PONG';
    } catch {
      return false;
    }
  }

  // ── Cache operations ───────────────────────────────────────────────────────

  async cacheMetrics(metric: PlatformMetrics): Promise<void> {
    if (!this.redis || !this.available) return;
    try {
      await this.redis.set(METRICS_KEY, JSON.stringify(metric), 'EX', METRICS_TTL_S);
    } catch (err) {
      this.logger.warn(`Failed to cache metrics: ${(err as Error).message}`);
    }
  }

  async getCachedMetrics(): Promise<PlatformMetrics | null> {
    if (!this.redis || !this.available) return null;
    try {
      const data = await this.redis.get(METRICS_KEY);
      return data ? (JSON.parse(data) as PlatformMetrics) : null;
    } catch (err) {
      this.logger.warn(`Failed to read cached metrics: ${(err as Error).message}`);
      return null;
    }
  }
}
