import { IsOptional, IsString } from 'class-validator';

export class GetMenuItemsDto {
  @IsOptional()
  @IsString()
  search?: string;
}
