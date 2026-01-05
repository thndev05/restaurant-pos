import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import {
  CreatePaymentDto,
  ProcessPaymentDto,
  RefundPaymentDto,
  UpdatePaymentStatusDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  async createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.createPayment(createPaymentDto);
  }

  @Get()
  async getAllPayments(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.paymentsService.getAllPayments(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }

  @Get(':id')
  async getPaymentById(@Param('id') id: string) {
    return this.paymentsService.getPaymentById(id);
  }

  @Get('session/:sessionId')
  async getPaymentBySessionId(@Param('sessionId') sessionId: string) {
    return this.paymentsService.getPaymentBySessionId(sessionId);
  }

  @Post(':id/process')
  async processPayment(
    @Param('id') id: string,
    @Body() processPaymentDto: ProcessPaymentDto,
  ) {
    return this.paymentsService.processPayment(id, processPaymentDto);
  }

  @Get(':id/qr-code')
  async getPaymentQrCode(@Param('id') id: string) {
    return this.paymentsService.getPaymentQrCode(id);
  }

  @Post(':id/refund')
  async refundPayment(
    @Param('id') id: string,
    @Body() refundPaymentDto: RefundPaymentDto,
  ) {
    return this.paymentsService.refundPayment(id, refundPaymentDto);
  }

  @Patch(':id/status')
  async updatePaymentStatus(
    @Param('id') id: string,
    @Body() updatePaymentStatusDto: UpdatePaymentStatusDto,
  ) {
    return this.paymentsService.updatePaymentStatus(
      id,
      updatePaymentStatusDto.status,
    );
  }
}
