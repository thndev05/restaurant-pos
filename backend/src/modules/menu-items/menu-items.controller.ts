import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MenuItemsService } from './menu-items.service';
import { GetMenuItemsDto, CreateMenuItemDto, UpdateMenuItemDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
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

  @Post('')
  @UseInterceptors(FileInterceptor('image'))
  createMenuItem(
    @Body() createMenuItemDto: CreateMenuItemDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.menuItemsService.createMenuItem(createMenuItemDto, file);
  }

  @Delete('/:id')
  softDeleteMenuItem(@Param('id') id: string) {
    return this.menuItemsService.softDeleteMenuItem(id);
  }

  @Delete('/:id/hard')
  hardDeleteMenuItem(@Param('id') id: string) {
    return this.menuItemsService.hardDeleteMenuItem(id);
  }

  @Patch('/:id')
  @UseInterceptors(FileInterceptor('image'))
  updateMenuItem(
    @Param('id') id: string,
    @Body() updateMenuItemDto: UpdateMenuItemDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.menuItemsService.updateMenuItem(updateMenuItemDto, file, id);
  }

  @Patch('/:id/toggle-availability')
  toggleAvailability(@Param('id') id: string) {
    return this.menuItemsService.toggleAvailability(id);
  }
}
