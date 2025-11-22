import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateSessionDto {
  @IsUUID()
  tableId: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  customerCount?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
