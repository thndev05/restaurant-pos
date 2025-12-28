import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto, UpdateSessionDto, CloseSessionDto, InitSessionDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { TablesService } from '../tables/tables.service';

@UseGuards(JwtAuthGuard)
@Controller('sessions')
export class SessionsController {
  constructor(
    private readonly sessionsService: SessionsService,
    private readonly tablesService: TablesService,
  ) {}

  /**
   * PUBLIC: Initialize customer session from QR code token
   * This is the entry point for QR-based ordering
   * 
   * Handles race conditions when multiple requests arrive simultaneously
   */
  @Public()
  @Post('init')
  async initSession(
    @Headers('authorization') authHeader: string,
    @Body() initDto: InitSessionDto,
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('QR token required');
    }

    const token = authHeader.substring(7);
    
    try {
      // Verify QR token and extract table info
      const { tableId } = await this.tablesService.verifyQrToken(token);
      
      // Initialize session (protected against race conditions)
      return await this.sessionsService.initializeSession(tableId, initDto);
    } catch (error) {
      // If table is already occupied, provide helpful message
      if (error.message?.includes('is currently occupied')) {
        throw error;
      }
      throw error;
    }
  }

  @Post()
  async createSession(@Body() createSessionDto: CreateSessionDto) {
    return this.sessionsService.createSession(createSessionDto);
  }

  @Get()
  async getAllSessions() {
    return this.sessionsService.getAllSessions();
  }

  @Get(':id')
  async getSessionById(@Param('id') id: string) {
    return this.sessionsService.getSessionById(id);
  }

  @Get(':id/bill')
  async getSessionBill(@Param('id') id: string) {
    return this.sessionsService.getSessionBill(id);
  }

  @Patch(':id')
  async updateSession(
    @Param('id') id: string,
    @Body() updateSessionDto: UpdateSessionDto,
  ) {
    return this.sessionsService.updateSession(id, updateSessionDto);
  }

  @Post(':id/close')
  async closeSession(
    @Param('id') id: string,
    @Body() closeSessionDto: CloseSessionDto,
  ) {
    return this.sessionsService.closeSession(id, closeSessionDto);
  }
}
