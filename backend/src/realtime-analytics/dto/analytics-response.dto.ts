/**
 * Response DTOs for realtime analytics endpoints (#480).
 *
 * Replaces `Promise<unknown>` return types with named, documented contracts.
 */
import { ApiProperty } from '@nestjs/swagger';

export class HealthStatusDto {
  @ApiProperty({ description: 'Whether the analytics service is operational' })
  operational!: boolean;

  @ApiProperty({ description: 'Feature availability flags', type: 'object', additionalProperties: { type: 'boolean' } })
  features!: Record<string, boolean>;

  @ApiProperty({ description: 'ISO 8601 timestamp of the health check' })
  timestamp!: string;
}

export class MetricsRowDto {
  @ApiProperty({ description: 'Date of the metric bucket (YYYY-MM-DD)' })
  date!: string;

  @ApiProperty({ description: 'Analytics event type' })
  type!: string;

  @ApiProperty({ description: 'Total event count in the bucket' })
  count!: number;

  @ApiProperty({ description: 'Count of distinct users in the bucket' })
  unique_users!: number;
}

export class MetricsResponseDto {
  @ApiProperty({ type: [MetricsRowDto] })
  rows!: MetricsRowDto[];
}

export class FunnelStepDto {
  @ApiProperty({ description: 'Analytics event type representing this funnel step' })
  type!: string;

  @ApiProperty({ description: 'Total events at this step' })
  count!: number;

  @ApiProperty({ description: 'Unique users at this step' })
  unique_users!: number;

  @ApiProperty({ description: 'Conversion rate from previous step (0–1)' })
  conversion_rate!: number;
}

export class FunnelResponseDto {
  @ApiProperty({ type: [FunnelStepDto] })
  steps!: FunnelStepDto[];
}

export class RetentionRowDto {
  @ApiProperty({ description: 'Cohort start date' })
  cohort_date!: string;

  @ApiProperty({ description: 'Return date for this cohort entry' })
  return_date!: string;

  @ApiProperty({ description: 'Number of retained users' })
  retained_users!: number;
}

export class RetentionResponseDto {
  @ApiProperty({ type: [RetentionRowDto] })
  cohorts!: RetentionRowDto[];
}

export class TrendPointDto {
  @ApiProperty({ description: 'Start of the time period bucket' })
  period!: string;

  @ApiProperty({ description: 'Analytics event type' })
  type!: string;

  @ApiProperty({ description: 'Event count in this period' })
  count!: number;

  @ApiProperty({ description: 'Unique users in this period' })
  unique_users!: number;
}

export class TrendsResponseDto {
  @ApiProperty({ type: [TrendPointDto] })
  points!: TrendPointDto[];
}
