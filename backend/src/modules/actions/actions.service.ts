import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { CreateActionDto, UpdateActionDto } from './dto';
import { ActionStatus } from 'src/generated/prisma';

@Injectable()
export class ActionsService {
  constructor(private readonly prismaService: PrismaService) {}

  private get db() {
    return this.prismaService.staffAction;
  }

  async createAction(createActionDto: CreateActionDto) {
    // Verify session exists
    const session = await this.prismaService.tableSession.findUnique({
      where: { id: createActionDto.sessionId },
      include: { table: true },
    });

    if (!session) {
      throw new BadRequestException(
        `Session with ID "${createActionDto.sessionId}" does not exist.`,
      );
    }

    if (session.status !== 'ACTIVE') {
      throw new BadRequestException(
        'Cannot create action for inactive session.',
      );
    }

    const action = await this.db.create({
      data: {
        sessionId: createActionDto.sessionId,
        actionType: createActionDto.actionType,
        description: createActionDto.description,
        status: ActionStatus.PENDING,
      },
      include: {
        session: {
          include: {
            table: true,
          },
        },
      },
    });

    return {
      code: 201,
      message: 'Action created successfully.',
      data: action,
    };
  }

  async getAllActions(status?: ActionStatus) {
    const where = status ? { status } : {};

    const actions = await this.db.findMany({
      where,
      include: {
        session: {
          include: {
            table: true,
          },
        },
        handledBy: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
      orderBy: [
        { status: 'asc' }, // Pending first
        { createdAt: 'desc' },
      ],
    });

    return {
      code: 200,
      data: actions,
    };
  }

  async getActionById(id: string) {
    const action = await this.db.findUnique({
      where: { id },
      include: {
        session: {
          include: {
            table: true,
          },
        },
        handledBy: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });

    if (!action) {
      throw new BadRequestException(`Action with ID "${id}" does not exist.`);
    }

    return {
      code: 200,
      data: action,
    };
  }

  async updateAction(id: string, updateActionDto: UpdateActionDto) {
    const action = await this.db.findUnique({
      where: { id },
    });

    if (!action) {
      throw new BadRequestException(`Action with ID "${id}" does not exist.`);
    }

    // If marking as completed/in-progress, ensure handledById is provided
    if (
      updateActionDto.status &&
      (updateActionDto.status === ActionStatus.COMPLETED ||
        updateActionDto.status === ActionStatus.IN_PROGRESS) &&
      !updateActionDto.handledById &&
      !action.handledById
    ) {
      throw new BadRequestException(
        'Handler ID is required when marking action as completed or in progress.',
      );
    }

    const updatedAction = await this.db.update({
      where: { id },
      data: updateActionDto,
      include: {
        session: {
          include: {
            table: true,
          },
        },
        handledBy: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });

    return {
      code: 200,
      message: `Action with ID "${id}" has been updated.`,
      data: updatedAction,
    };
  }

  async deleteAction(id: string) {
    const action = await this.db.findUnique({
      where: { id },
    });

    if (!action) {
      throw new BadRequestException(`Action with ID "${id}" does not exist.`);
    }

    await this.db.delete({
      where: { id },
    });

    return {
      code: 200,
      message: `Action with ID "${id}" has been deleted.`,
    };
  }

  async getActionsBySessionId(sessionId: string) {
    const actions = await this.db.findMany({
      where: { sessionId },
      include: {
        handledBy: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      code: 200,
      data: actions,
    };
  }

  async getPendingActions() {
    return this.getAllActions(ActionStatus.PENDING);
  }
}
