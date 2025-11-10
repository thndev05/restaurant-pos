import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { TablesService } from './tables.service';
import { CreateTableDto } from './dto/create-table.dto';
import { TableStatus } from 'src/generated/prisma';
import { UpdateTableDto } from './dto/update-table.dto';
import { get } from 'axios';
import { GetTablesDto } from './dto/get-tables.dto';

@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) { }

  @Get('')
  async getTables(@Query() getTablesDto: GetTablesDto) {
    return this.tablesService.getTables(getTablesDto);
  }

  @Get(':id')
  async getTableById(@Param('id') id: string) {
    return this.tablesService.getTableById(id);
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

  @Delete(':id')
  async deleteTable(@Param('id') id: string) {
    return this.tablesService.deleteTable(id);
  }
}
