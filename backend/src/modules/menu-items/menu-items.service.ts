import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetMenuItemsDto } from './dto/get-menu-items.dto';
import { CreateMenuItemDto } from './dto/create-menu-items.dto';
import { CloudinaryService } from 'src/config/cloudinary.service';
import {
  buildPrismaSearchQuery,
  filterBySearchTerm,
} from 'src/common/utils/search.util';
import { UpdateMenuItemDto } from './dto/update-menu-items.dto';

@Injectable()
export class MenuItemsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  private get db() {
    return this.prismaService.menuItem;
  }

  async getMenuItems(filterDto: GetMenuItemsDto) {
    const { search } = filterDto;
    const searchTerm = search?.trim();

    // Build where condition
    const where: any = {
      isActive: true,
      ...(searchTerm && buildPrismaSearchQuery(searchTerm, ['name'])),
    };

    // Query database
    const menuItems = await this.db.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    // Filter by search term (handle Vietnamese accents)
    return searchTerm
      ? filterBySearchTerm(menuItems, searchTerm, ['name'])
      : menuItems;
  }

  async getMenuItemById(id: string) {
    const menuItem = await this.db.findUnique({
      where: { id },
    });

    if (!menuItem) {
      return new NotFoundException(`Menu item with id ${id} not found.`);
    } else {
      return this.db.findUnique({
        where: { id },
      });
    }
  }

  async createMenuItem(createMenuItemDto: CreateMenuItemDto, file?: any) {
    const { name, price } = createMenuItemDto;

    let imageUrl: string | null = null;

    if (file) {
      const uploadResult = await this.cloudinaryService.uploadImage(file);
      imageUrl = uploadResult.secure_url;
    }

    return this.db.create({
      data: {
        name,
        price,
        image: imageUrl,
      },
    });
  }

  async softDeleteMenuItem(id: string) {
    const menuItem = await this.db.findUnique({
      where: { id }
    });

    if (!menuItem) {
      return new NotFoundException(`Menu item with id ${id} not found.`);
    }

    await this.db.update({
      where: { id },
      data: { isActive: false },
    });

    return {
      code: 200,
      message: `Menu item with id ${id} has been soft deleted.`,
    };
  }

  async hardDeleteMenuItem(id: string) {
    const menuItem = await this.db.findUnique({
      where: { id }
    });

    if (!menuItem) {
      return new NotFoundException(`Menu item with id ${id} not found.`);
    }

    const publicId = menuItem?.image;
    if (publicId) {
      await this.cloudinaryService.deleteImage(publicId);
    }
      
    await this.db.delete({
      where: { id },
    });

    return {
      code: 200,
      message: `Menu item with id ${id} has been hard deleted.`,
    }
  }

  async updateMenuItem(updateMenuItemDto: UpdateMenuItemDto, file: any, id: string) {
    const { name, price } = updateMenuItemDto;
    let imageUrl: string | null = null;

    const menuItem = await this.db.findUnique({
      where: { 
        id,
        isActive: true
      },
    });

    if (!menuItem) {
      return new NotFoundException(`Menu item with id ${id} not found.`);
    } else {
      const publicImage = menuItem?.image;
      if (publicImage) {
        await this.cloudinaryService.deleteImage(publicImage);
      }
    }

    if (file) {
      const uploadResult = await this.cloudinaryService.uploadImage(file);
      imageUrl = uploadResult.secure_url;
    }

    await this.db.update({
      where: { id },
      data: {
        name,
        price,
        image: imageUrl,
        updatedAt: new Date(),
      }
    });
    
    return {
      code: 200,
      message: `Menu item with id ${id} has been updated.`
    }
  }
}
