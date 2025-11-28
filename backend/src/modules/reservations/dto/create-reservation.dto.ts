import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsDateString,
  Matches,
  IsEmail,
} from 'class-validator';

export class CreateReservationDto {
  @IsDateString()
  @IsNotEmpty()
  reservationTime: string;

  @IsInt()
  @Min(1)
  @Max(20)
  partySize: number;

  @IsString()
  @IsNotEmpty()
  guestName: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[\d\s()+-]+$/, {
    message: 'Phone number must contain only digits and valid characters',
  })
  guestPhone: string;

  @IsEmail()
  @IsOptional()
  guestEmail?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsNotEmpty()
  tableId: string;
}
