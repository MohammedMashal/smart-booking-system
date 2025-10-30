import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './service.entity';
import { CreateServiceDto } from './dtos/create-service.dto';
import { UpdateServiceDto } from './dtos/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepo: Repository<Service>,
  ) {}

  async create(dto: CreateServiceDto, ownerId: string): Promise<Service> {
    const service = this.serviceRepo.create({
      ...dto,
      owner: { id: ownerId },
    });
    return await this.serviceRepo.save(service);
  }

  async findAll(): Promise<Service[]> {
    return await this.serviceRepo.find({
      relations: ['owner'],
    });
  }

  async findOne(id: string): Promise<Service> {
    const service = await this.serviceRepo.findOne({
      where: { id },
      relations: ['owner'],
    });
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  async update(
    id: string,
    dto: UpdateServiceDto,
    userId: string,
  ): Promise<Service> {
    const service = await this.findOne(id);

    if (service.owner.id !== userId) {
      throw new ForbiddenException('You are not the owner of this service');
    }

    Object.assign(service, dto);
    return await this.serviceRepo.save(service);
  }

  async remove(id: string, userId: string): Promise<void> {
    const service = await this.findOne(id);

    if (service.owner.id !== userId) {
      throw new ForbiddenException('You are not the owner of this service');
    }

    await this.serviceRepo.remove(service);
  }
}
