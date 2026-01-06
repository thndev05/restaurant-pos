import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { QueryNotificationsDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request as ExpressRequest } from 'express';
import { User } from '../../generated/prisma';

interface RequestWithUser extends ExpressRequest {
  user: User;
}

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async findAll(
    @Request() req: RequestWithUser,
    @Query() query: QueryNotificationsDto,
  ) {
    return this.notificationsService.findAll(req.user.id, query);
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req: RequestWithUser) {
    const count = await this.notificationsService.getUnreadCount(
      req.user.id,
    );
    return { count };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.notificationsService.findOne(id, req.user.id);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }

  @Patch(':id/unread')
  async markAsUnread(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.notificationsService.markAsUnread(id, req.user.id);
  }

  @Post('mark-all-read')
  async markAllAsRead(@Request() req: RequestWithUser) {
    await this.notificationsService.markAllAsRead(req.user.id);
    return { message: 'All notifications marked as read' };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.notificationsService.remove(id, req.user.id);
  }
}
