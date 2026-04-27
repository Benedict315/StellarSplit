import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AnalyticsIngestService } from './analytics-ingest.service';
import { AnalyticsController } from './analytics.controller';
// #466: Inject lifecycle-managed Redis cache service
import { AnalyticsCacheService } from './analytics-cache.service';

@Module({
  imports: [ConfigModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsIngestService, AnalyticsCacheService],
  exports: [AnalyticsIngestService, AnalyticsCacheService],
})
export class RealtimeAnalyticsModule {}
