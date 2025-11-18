import { IsEnum, IsOptional } from 'class-validator';
import { TableStatus } from 'src/generated/prisma';

export class GetTablesDto {
  @IsOptional()
  @IsEnum(TableStatus)
  status: TableStatus;
}
