import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prismaService: PrismaService) {}

  private get db() {
    return this.prismaService.customer;
  }

  async getCustomers(query?: string) {
    return this.db.findMany({
      where: {
        isActive: true,
        ...(query && {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { phone: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCustomerById(id: string) {
    const customer = await this.db.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with id ${id} not found.`);
    }

    return customer;
  }

  async createCustomer(createCustomerDto: CreateCustomerDto) {
    const { name, phone } = createCustomerDto;

    // Check if phone already exists
    const existingPhone = await this.db.findFirst({
      where: { phone },
    });

    if (existingPhone) {
      throw new BadRequestException(`Phone number "${phone}" already exists.`);
    }

    return this.db.create({
      data: {
        name,
        phone,
      },
    });
  }

  async updateCustomer(id: string, updateCustomerDto: UpdateCustomerDto) {
    const { name, phone } = updateCustomerDto;

    const customer = await this.getCustomerById(id);

    if (!customer) {
      throw new NotFoundException(`Customer with id ${id} not found.`);
    }

    // Check if new phone already exists (if phone is being updated)
    if (phone && phone !== customer.phone) {
      const existingPhone = await this.db.findFirst({
        where: { phone },
      });

      if (existingPhone) {
        throw new BadRequestException(
          `Phone number "${phone}" already exists.`,
        );
      }
    }

    await this.db.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        updatedAt: new Date(),
      },
    });

    return {
      code: 200,
      message: `Customer with id ${id} has been updated.`,
    };
  }

  async softDeleteCustomer(id: string) {
    const customer = await this.getCustomerById(id);

    if (!customer) {
      throw new NotFoundException(`Customer with id ${id} not found.`);
    }

    await this.db.update({
      where: { id },
      data: { isActive: false },
    });

    return {
      code: 200,
      message: `Customer with id ${id} has been soft deleted.`,
    };
  }

  async hardDeleteCustomer(id: string) {
    const customer = await this.getCustomerById(id);

    if (!customer) {
      throw new NotFoundException(`Customer with id ${id} not found.`);
    }

    await this.db.delete({
      where: { id },
    });

    return {
      code: 200,
      message: `Customer with id ${id} has been permanently deleted.`,
    };
  }
}
