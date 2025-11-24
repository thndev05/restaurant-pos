import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ActionStatus } from 'src/generated/prisma';

export class UpdateActionDto {
  @IsOptional()
  @IsEnum(ActionStatus)
  status?: ActionStatus;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  handledById?: string;
}
