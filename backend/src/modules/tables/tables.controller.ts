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
import { TablesService } from './tables.service';
import { CreateTableDto, UpdateTableDto, GetTablesDto } from './dto';
import { TableStatus } from 'src/generated/prisma';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Get('')
  async getTables(@Query() getTablesDto: GetTablesDto) {
    return this.tablesService.getTables(getTablesDto);
  }

  @Get(':id')
  async getTableById(@Param('id') id: string) {
    return this.tablesService.getTableById(id);
  }

  @Get(':id/reservations')
  async getUpcomingReservations(@Param('id') id: string) {
    return this.tablesService.getUpcomingReservations(id);
  }

  @Post('')
  async createTable(@Body() createTableDto: CreateTableDto) {
    return this.tablesService.createTable(createTableDto);
  }

  @Patch(':id/status/')
  async updateTableStatus(
    @Param('id') id: string,
    @Body('status') status: TableStatus,
  ) {
    return this.tablesService.updateTableStatus(id, status);
  }

  @Patch(':id')
  async updateTable(
    @Param('id') id: string,
    @Body() updateTableDto: UpdateTableDto,
  ) {
    return this.tablesService.updateTable(id, updateTableDto);
  }

  @Post(':id/generate-qr')
  async generateQrToken(
    @Param('id') id: string,
    @Body('branchId') branchId?: string,
  ) {
    return this.tablesService.generateQrToken(id, branchId);
  }

  @Delete(':id')
  async deleteTable(@Param('id') id: string) {
    return this.tablesService.deleteTable(id);
  }
}
