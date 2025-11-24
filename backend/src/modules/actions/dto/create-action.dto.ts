import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ActionType } from 'src/generated/prisma';

export class CreateActionDto {
  @IsNotEmpty()
  @IsString()
  sessionId: string;

  @IsNotEmpty()
  @IsEnum(ActionType)
  actionType: ActionType;

  @IsOptional()
  @IsString()
  description?: string;
}
