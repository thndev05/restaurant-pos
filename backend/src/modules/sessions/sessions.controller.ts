import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto, UpdateSessionDto, CloseSessionDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  async createSession(@Body() createSessionDto: CreateSessionDto) {
    return this.sessionsService.createSession(createSessionDto);
  }

  @Get(':id')
  async getSessionById(@Param('id') id: string) {
    return this.sessionsService.getSessionById(id);
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
