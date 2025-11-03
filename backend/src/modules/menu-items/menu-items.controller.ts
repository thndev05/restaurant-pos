import { Controller, Get, Query } from '@nestjs/common';
import { MenuItemsService } from './menu-items.service';
import { GetMenuItemsDto } from './dto/get-menu-items.dto';

@Controller('menu-items')
export class MenuItemsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Get('')
  getMenuItems(
    @Query() filterDto: GetMenuItemsDto
  ) {
    return this.menuItemsService.getMenuItems(filterDto);
  }

  @Get(':id')
  getMenuItemById(id: string) {
    return this.menuItemsService.getMenuItemById(id);
  }
}
