import { IsDateString, IsUUID } from 'class-validator';

export class CreateAvailabilityDto {
  @IsUUID()
  serviceId: string;

  @IsDateString()
  startAt: string;

  @IsDateString()
  endAt: string;
}
