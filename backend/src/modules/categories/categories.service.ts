import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prismaService: PrismaService) {}

  private get db() {
    return this.prismaService.category;
  }

  async getCategories() {
    return this.db.findMany({
      where: { isActive: true },
      // orderBy: { name: 'asc' },
      include: { menuItems: true },
    });
  }

  async getCategoryById(id: string) {
    const category = await this.db.findUnique({
      where: { id },
      include: { menuItems: true },
    });

    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found.`);
    }

    return category;
  }

  async createCategory(createCategoryDto: CreateCategoryDto) {
    const { name } = createCategoryDto;

    // Check if category already exists
    const existingCategory = await this.db.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });

    if (existingCategory) {
      throw new BadRequestException(`Category "${name}" already exists.`);
    }

    return this.db.create({
      data: { name },
    });
  }

  async updateCategory(id: string, updateCategoryDto: UpdateCategoryDto) {
    const { name } = updateCategoryDto;

    const category = await this.db.findUnique({ where: { id } });

    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found.`);
    }

    // Check if new name already exists (if name is being updated)
    if (name && name !== category.name) {
      const existingCategory = await this.db.findFirst({
        where: { name: { equals: name, mode: 'insensitive' } },
      });

      if (existingCategory) {
        throw new BadRequestException(`Category "${name}" already exists.`);
      }
    }

    await this.db.update({
      where: { id },
      data: {
        ...(name && { name }),
        updatedAt: new Date(),
      },
    });

    return {
      code: 200,
      message: `Category with id ${id} has been updated.`,
    };
  }

  async softDeleteCategory(id: string) {
    const category = await this.db.findUnique({ where: { id } });

    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found.`);
    }

    await this.db.update({
      where: { id },
      data: { isActive: false },
    });

    return {
      code: 200,
      message: `Category with id ${id} has been soft deleted.`,
    };
  }

  async hardDeleteCategory(id: string) {
    const category = await this.db.findUnique({
      where: { id },
      include: { menuItems: true },
    });

    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found.`);
    }

    // Check if category has menu items
    if (category.menuItems.length > 0) {
      throw new BadRequestException(
        `Cannot delete category with id ${id} because it has ${category.menuItems.length} menu items.`,
      );
    }

    await this.db.delete({ where: { id } });

    return {
      code: 200,
      message: `Category with id ${id} has been hard deleted.`,
    };
  }
}
