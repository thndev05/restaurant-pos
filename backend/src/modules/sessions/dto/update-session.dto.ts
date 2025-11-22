import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { SessionStatus } from 'src/generated/prisma';

export class UpdateSessionDto {
  @IsOptional()
  @IsEnum(SessionStatus)
  status?: SessionStatus;

  @IsOptional()
  @IsInt()
  @Min(1)
  customerCount?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
