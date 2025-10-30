import { IsUUID, IsEnum } from 'class-validator';
import { BookingStatus } from '../types/booking-status.enum';

export class CreateBookingDto {
  @IsUUID()
  serviceId: string;

  @IsUUID()
  availabilityId: string;

  @IsEnum(BookingStatus)
  status?: BookingStatus;
}
