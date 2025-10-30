import { IsEnum, IsOptional } from 'class-validator';
import { BookingStatus } from '../types/booking-status.enum';

export class UpdateBookingDto {
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;
}
