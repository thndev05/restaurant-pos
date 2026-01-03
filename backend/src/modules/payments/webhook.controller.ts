import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { SepayWebhookDto } from './dto';
import { Public } from '../auth/decorators/public.decorator';

/**
 * Webhook Controller for SePay Integration
 * Handles incoming webhook notifications from SePay when bank transfers occur
 *
 * Endpoint: POST /webhooks/sepay
 * This endpoint must be configured in SePay dashboard
 */
@Controller('webhooks')
export class WebhookController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * SePay webhook endpoint
   * Receives bank transfer notifications and processes payments
   *
   * @param webhookData - Transfer data from SePay
   * @returns Success response with HTTP 200 or 201
   */
  @Public()
  @Post('sepay')
  @HttpCode(HttpStatus.OK)
  async handleSepayWebhook(@Body() webhookData: SepayWebhookDto) {
    const result = await this.paymentsService.handleSepayWebhook(webhookData);

    // SePay expects success: true with HTTP 200 or 201
    return {
      success: result.success,
      message: result.message,
      ...(result.paymentId && { paymentId: result.paymentId }),
    };
  }
}
