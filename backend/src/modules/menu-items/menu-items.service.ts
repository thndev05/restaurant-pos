import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetMenuItemsDto } from './dto/get-menu-items.dto';
import {
  buildPrismaSearchQuery,
  filterBySearchTerm,
} from 'src/common/utils/search.util';

@Injectable()
export class MenuItemsService {
  constructor(private readonly prismaService: PrismaService) {}

  async getMenuItems(filterDto: GetMenuItemsDto) {
    const { search } = filterDto;
    const searchTerm = search?.trim();

    // Build where condition
    const where: any = {
      isActive: true,
      ...(searchTerm && buildPrismaSearchQuery(searchTerm, ['name'])),
    };

    // Query database
    const menuItems = await this.prismaService.menuItem.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    // Filter by search term (handle Vietnamese accents)
    return searchTerm
      ? filterBySearchTerm(menuItems, searchTerm, ['name'])
      : menuItems;
  }

  async getMenuItemById(id: string) {
    const menuItem = this.prismaService.menuItem.findUnique({
      where: { id },
    });

    return menuItem;
  }
}
