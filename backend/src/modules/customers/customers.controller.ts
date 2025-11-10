import { Controller, Get, Post, Body, Patch, Delete, Param, Query } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  getCustomers(@Query('q') query?: string) {
    return this.customersService.getCustomers(query);
  }

  @Get(':id')
  getCustomerById(@Param('id') id: string) {
    return this.customersService.getCustomerById(id);
  }

  @Post()
  createCustomer(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.createCustomer(createCustomerDto);
  }

  @Patch(':id')
  updateCustomer(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customersService.updateCustomer(id, updateCustomerDto);
  }

  @Delete(':id')
  softDeleteCustomer(@Param('id') id: string) {
    return this.customersService.softDeleteCustomer(id);
  }

  @Delete(':id/hard')
  hardDeleteCustomer(@Param('id') id: string) {
    return this.customersService.hardDeleteCustomer(id);
  }
}
