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

    let where: any = {};

    // Build query search cho database
    if (search && search.trim()) {
      where = buildPrismaSearchQuery(search, ['name']);
      where.isActive = true;
    }
    
    const menuItems = await this.prismaService.menuItem.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    // Filter thêm ở application level để xử lý dấu tiếng Việt
    if (search && search.trim()) {
      return filterBySearchTerm(menuItems, search, ['name']);
    }

    return menuItems;
  }

  async getMenuItemById(id: string) {
    const menuItem = this.prismaService.menuItem.findUnique({
      where: { id },
    });

    return menuItem;
  }
}
