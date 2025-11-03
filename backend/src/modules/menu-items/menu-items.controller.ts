import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MenuItemsService } from './menu-items.service';
import { GetMenuItemsDto } from './dto/get-menu-items.dto';
import { CreateMenuItemDto } from './dto/create-menu-items.dto';

@Controller('menu-items')
export class MenuItemsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Get('')
  getMenuItems(@Query() filterDto: GetMenuItemsDto) {
    return this.menuItemsService.getMenuItems(filterDto);
  }

  @Get('/:id')
  getMenuItemById(@Param('id') id: string) {
    return this.menuItemsService.getMenuItemById(id);
  }

  @Post('/create')
  @UseInterceptors(FileInterceptor('image'))
  createMenuItem(
    @Body() createMenuItemDto: CreateMenuItemDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.menuItemsService.createMenuItem(createMenuItemDto, file);
  }
}
