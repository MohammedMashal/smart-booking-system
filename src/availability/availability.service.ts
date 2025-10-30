import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Availability } from './availability.entity';
import { CreateAvailabilityDto } from './dtos/create-availability.dto';
import { UpdateAvailabilityDto } from './dtos/update-availability.dto';
import { Service } from 'src/services/service.entity';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(Availability)
    private readonly availabilityRepo: Repository<Availability>,
    @InjectRepository(Service)
    private readonly serviceRepo: Repository<Service>,
  ) {}

  async create(dto: CreateAvailabilityDto) {
    const service = await this.serviceRepo.findOne({
      where: { id: dto.serviceId },
    });
    if (!service) throw new NotFoundException('Service not found');

    const availability = this.availabilityRepo.create({
      ...dto,
      service,
    });
    return this.availabilityRepo.save(availability);
  }

  findAll() {
    return this.availabilityRepo.find({ relations: ['service'] });
  }

  async findOne(id: string) {
    const availability = await this.availabilityRepo.findOne({
      where: { id },
      relations: ['service'],
    });
    if (!availability) throw new NotFoundException('Availability not found');
    return availability;
  }

  async update(id: string, dto: UpdateAvailabilityDto) {
    const availability = await this.findOne(id);
    Object.assign(availability, dto);
    return this.availabilityRepo.save(availability);
  }

  async remove(id: string) {
    const availability = await this.findOne(id);
    return this.availabilityRepo.remove(availability);
  }
}
