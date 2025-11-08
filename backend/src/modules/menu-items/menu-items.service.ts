import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { GetMenuItemsDto } from './dto/get-menu-items.dto';
import { CreateMenuItemDto } from './dto/create-menu-items.dto';
import { CloudinaryService } from 'src/config/cloudinary/cloudinary.service';
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
      include: { category: true },
    });

    // Filter by search term (handle Vietnamese accents)
    return searchTerm
      ? filterBySearchTerm(menuItems, searchTerm, ['name'])
      : menuItems;
  }

  async getMenuItemById(id: string) {
    const menuItem = await this.db.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!menuItem) {
      throw new NotFoundException(`Menu item with id ${id} not found.`);
    }

    return menuItem;
  }

  async createMenuItem(createMenuItemDto: CreateMenuItemDto, file?: any) {
    const { name, price, categoryId } = createMenuItemDto;

    let imageUrl: string | null = null;

    if (file) {
      const uploadResult = await this.cloudinaryService.uploadImage(file);
      imageUrl = uploadResult.secure_url;
    }

    // Validate category exists and is active if provided
    if (categoryId) {
      const category = await this.prismaService.category.findUnique({
        where: { id: categoryId },
      });

      if (!category || !category.isActive) {
        throw new NotFoundException(`Category with id ${categoryId} not found or inactive.`);
      }
    }

    return this.db.create({
      data: {
        name,
        price,
        image: imageUrl,
        categoryId: categoryId || null,
      },
    });
  }

  async softDeleteMenuItem(id: string) {
    const menuItem = await this.db.findUnique({
      where: { id },
    });

    if (!menuItem) {
      throw new NotFoundException(`Menu item with id ${id} not found.`);
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
      where: { id },
    });

    if (!menuItem) {
      throw new NotFoundException(`Menu item with id ${id} not found.`);
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
    };
  }

  async updateMenuItem(
    updateMenuItemDto: UpdateMenuItemDto,
    file: any,
    id: string,
  ) {
    const { name, price, categoryId } = updateMenuItemDto;
    let imageUrl: string | null = null;

    const menuItem = await this.db.findUnique({
      where: { id },
    });

    if (!menuItem) {
      throw new NotFoundException(`Menu item with id ${id} not found.`);
    }

    // Delete old image if new file is provided
    if (file) {
      const publicImage = menuItem?.image;
      if (publicImage) {
        await this.cloudinaryService.deleteImage(publicImage);
      }
      const uploadResult = await this.cloudinaryService.uploadImage(file);
      imageUrl = uploadResult.secure_url;
    }

    // Validate category exists and is active if provided
    if (categoryId) {
      const category = await this.prismaService.category.findUnique({
        where: { id: categoryId },
      });

      if (!category || !category.isActive) {
        throw new NotFoundException(`Category with id ${categoryId} not found or inactive.`);
      }
    }

    await this.db.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(price && { price }),
        ...(imageUrl && { image: imageUrl }),
        ...(categoryId && { categoryId }),
        updatedAt: new Date(),
      },
    });

    return {
      code: 200,
      message: `Menu item with id ${id} has been updated.`,
    };
  }
}
