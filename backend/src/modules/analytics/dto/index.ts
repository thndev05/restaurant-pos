import { IsDateString, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetAnalyticsDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}

export class GetComparisonDto extends GetAnalyticsDto {
  @IsDateString()
  previousStartDate: string;

  @IsDateString()
  previousEndDate: string;
}

export class GetBestSellingItemsDto extends GetAnalyticsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
