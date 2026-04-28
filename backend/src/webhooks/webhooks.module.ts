import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { WebhookDeliveryService } from './webhook-delivery.service';
import { TestWebhookDispatcher } from './test-webhook-dispatcher';
import { WebhookProcessor } from './webhook.processor';
import { Webhook } from './webhook.entity';
import { WebhookDelivery } from './webhook-delivery.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Webhook, WebhookDelivery]),
    BullModule.registerQueue({
      name: 'webhook_queue',
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    }),
  ],
  controllers: [WebhooksController],
  providers: [WebhooksService, WebhookDeliveryService, WebhookProcessor, TestWebhookDispatcher],
  exports: [WebhooksService, WebhookDeliveryService, TestWebhookDispatcher],
})
export class WebhooksModule {}
