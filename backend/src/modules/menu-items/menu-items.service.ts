import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetMenuItemsDto } from './dto/get-menu-items.dto';
import { CreateMenuItemDto } from './dto/create-menu-items.dto';
import { CloudinaryService } from 'src/config/cloudinary.service';
import {
  buildPrismaSearchQuery,
  filterBySearchTerm,
} from 'src/common/utils/search.util';

@Injectable()
export class MenuItemsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

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

  async createMenuItem(createMenuItemDto: CreateMenuItemDto, file?: any) {
    const { name, price } = createMenuItemDto;

    let imageUrl: string | null = null;

    if (file) {
      const uploadResult = await this.cloudinaryService.uploadImage(file);
      imageUrl = uploadResult.secure_url;
    }

    const menuItem = await this.prismaService.menuItem.create({
      data: {
        name,
        price,
        image: imageUrl,
      },
    });

    return menuItem;
  }
}
