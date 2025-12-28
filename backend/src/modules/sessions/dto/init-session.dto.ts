import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class InitSessionDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  customerCount?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class InitSessionResponseDto {
  sessionId: string;
  sessionSecret: string;
  tableInfo: {
    id: string;
    number: number;
    capacity: number;
    status: string;
  };
  expiresAt: Date;
}
