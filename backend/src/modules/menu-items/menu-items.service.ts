import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MenuItemsService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAllMenuItems() {
    return this.prismaService.menuItem.findMany();
  }

  async getMenuItemById(id: string) {
    return this.prismaService.menuItem.findUnique({
      where: { id },
    });
  }
}
