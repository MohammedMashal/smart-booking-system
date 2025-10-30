import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Booking } from './booking.entity';
import { Availability } from 'src/availability/availability.entity';
import { CreateBookingDto } from './dtos/create-booking.dto';
import { ServicesService } from 'src/services/services.service';
import { BookingStatus } from './types/booking-status.enum';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    private readonly dataSource: DataSource,
    private readonly servicesService: ServicesService,
  ) {}

  async create(dto: CreateBookingDto, userId: string) {
    await this.servicesService.findOne(dto.serviceId); //checking if it's exist

    return this.dataSource.transaction(async (manager) => {
      const availability = await manager.findOneOrFail(Availability, {
        where: { id: dto.availabilityId },
      });
      if (!availability.isAvailable) {
        throw new ConflictException('Already booked');
      }
      availability.isAvailable = false;
      await manager.save(availability);

      const booking = manager.create(Booking, {
        user: { id: userId },
        service: { id: dto.serviceId },
        availability,
      });

      return await manager.save(booking);
    });
  }

  async cancel(id: string, userId: string) {
    const booking = await this.bookingRepo.findOne({
      where: { id },
      relations: ['user', 'availability'],
    });
    if (!booking) throw new NotFoundException('booking not found');

    if (userId !== booking.user.id) throw new UnauthorizedException();

    return this.dataSource.transaction(async (manager) => {
      booking.status = BookingStatus.CANCELLED;
      booking.availability.isAvailable = true;
      await manager.save(booking.availability);
      return await manager.save(booking);
    });
  }

  async findAllByUser(userId: string) {
    return this.bookingRepo.find({
      where: { user: { id: userId } },
      relations: ['service', 'availability'],
    });
  }

  async findOneByUser(id: string, userId: string) {
    const booking = await this.bookingRepo.findOne({
      where: { id, user: { id: userId } },
      relations: ['service', 'availability'],
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }
}
