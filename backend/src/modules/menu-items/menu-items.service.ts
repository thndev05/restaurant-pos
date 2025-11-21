import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { GetMenuItemsDto, CreateMenuItemDto, UpdateMenuItemDto } from './dto';
import { CloudinaryService } from 'src/config/cloudinary/cloudinary.service';
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

  private get db() {
    return this.prismaService.menuItem;
  }

  async getMenuItems(filterDto: GetMenuItemsDto) {
    const { search } = filterDto;
    const searchTerm = search?.trim();

    // Build where condition
    const searchQuery = searchTerm
      ? buildPrismaSearchQuery(searchTerm, ['name'])
      : {};
    const where = {
      isActive: true,
      ...searchQuery,
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
    const { name, description, price, categoryId, isAvailable } =
      createMenuItemDto;

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
        throw new NotFoundException(
          `Category with id ${categoryId} not found or inactive.`,
        );
      }
    }

    return this.db.create({
      data: {
        name,
        description,
        price,
        image: imageUrl,
        isAvailable: isAvailable ?? true,
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
    const { name, description, price, categoryId, isAvailable } =
      updateMenuItemDto;
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
        throw new NotFoundException(
          `Category with id ${categoryId} not found or inactive.`,
        );
      }
    }

    await this.db.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(price && { price }),
        ...(imageUrl && { image: imageUrl }),
        ...(categoryId && { categoryId }),
        ...(isAvailable !== undefined && { isAvailable }),
        updatedAt: new Date(),
      },
    });

    return {
      code: 200,
      message: `Menu item with id ${id} has been updated.`,
    };
  }

  async toggleAvailability(id: string) {
    const menuItem = await this.db.findUnique({
      where: { id },
    });

    if (!menuItem) {
      throw new NotFoundException(`Menu item with id ${id} not found.`);
    }

    await this.db.update({
      where: { id },
      data: {
        isAvailable: !menuItem.isAvailable,
        updatedAt: new Date(),
      },
    });

    return {
      code: 200,
      message: `Menu item availability toggled successfully.`,
      data: { isAvailable: !menuItem.isAvailable },
    };
  }
}
