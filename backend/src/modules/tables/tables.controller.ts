import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { TablesService } from './tables.service';
import { CreateTableDto } from './dto/create-table.dto';
import { TableStatus } from 'src/generated/prisma';
import { UpdateTableDto } from './dto/update-table.dto';

@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) { }

  @Get('')
  async getTables() {
    return this.tablesService.getTables();
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
