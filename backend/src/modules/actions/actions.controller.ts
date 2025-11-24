import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ActionsService } from './actions.service';
import { CreateActionDto, UpdateActionDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActionStatus } from 'src/generated/prisma';

@UseGuards(JwtAuthGuard)
@Controller('actions')
export class ActionsController {
  constructor(private readonly actionsService: ActionsService) {}

  @Post()
  async createAction(@Body() createActionDto: CreateActionDto) {
    return this.actionsService.createAction(createActionDto);
  }

  @Get()
  async getAllActions(@Query('status') status?: ActionStatus) {
    return this.actionsService.getAllActions(status);
  }

  @Get('pending')
  async getPendingActions() {
    return this.actionsService.getPendingActions();
  }

  @Get('session/:sessionId')
  async getActionsBySessionId(@Param('sessionId') sessionId: string) {
    return this.actionsService.getActionsBySessionId(sessionId);
  }

  @Get(':id')
  async getActionById(@Param('id') id: string) {
    return this.actionsService.getActionById(id);
  }

  @Patch(':id')
  async updateAction(
    @Param('id') id: string,
    @Body() updateActionDto: UpdateActionDto,
  ) {
    return this.actionsService.updateAction(id, updateActionDto);
  }

  @Delete(':id')
  async deleteAction(@Param('id') id: string) {
    return this.actionsService.deleteAction(id);
  }
}
