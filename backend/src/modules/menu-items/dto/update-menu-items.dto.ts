import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsString, IsOptional } from "class-validator";

export class UpdateMenuItemDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  categoryId?: string;
}