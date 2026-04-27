/**
 * Request DTOs for realtime analytics endpoints (#480).
 *
 * Extracted from analytics.controller.ts so that request contracts are
 * stable, importable, and independently testable.
 */
import {
  IsOptional,
  IsDateString,
  IsString,
  IsArray,
  IsIn,
  Min,
  Max,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class QueryMetricsDto {
  @ApiPropertyOptional({ description: 'Start of date range (ISO 8601)', example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'End of date range (ISO 8601)', example: '2024-01-31' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ description: 'Filter by analytics event type' })
  @IsOptional()
  @IsString()
  eventType?: string;
}

export class QueryFunnelDto {
  @ApiPropertyOptional({ description: 'Ordered list of event types for funnel analysis', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  eventTypes?: string[];

  @ApiPropertyOptional({ description: 'Start of date range (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'End of date range (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}

export class QueryRetentionDto {
  @ApiPropertyOptional({ description: 'Event type to use as the retention anchor' })
  @IsOptional()
  @IsString()
  eventType?: string;

  @ApiPropertyOptional({ description: 'Start date for cohort analysis (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Number of retention periods (1–90)', minimum: 1, maximum: 90 })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(90)
  periods?: number;
}

export class QueryTrendsDto {
  @ApiPropertyOptional({ description: 'Event types to include in trend analysis', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  eventTypes?: string[];

  @ApiPropertyOptional({ description: 'Start of date range (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'End of date range (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ description: 'Time interval for grouping', enum: ['hour', 'day', 'week', 'month'] })
  @IsOptional()
  @IsIn(['hour', 'day', 'week', 'month'])
  interval?: 'hour' | 'day' | 'week' | 'month';
}
