import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { TableStatus } from 'src/generated/prisma';

export class UpdateTableDto {
  @IsOptional()
  @IsInt()
  number?: number;

  @IsOptional()
  @IsInt()
  capacity?: number;

  @IsOptional()
  @IsEnum(TableStatus)
  status?: TableStatus;

  @IsOptional()
  @IsString()
  location?: string;
}
