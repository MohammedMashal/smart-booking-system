import { Test, TestingModule } from '@nestjs/testing';
import { AvailabilityService } from './availability.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Availability } from './availability.entity';
import { Service } from 'src/services/service.entity';
import { NotFoundException } from '@nestjs/common';

describe('AvailabilityService', () => {
  let service: AvailabilityService;

  const mockService = {
    id: 'service-123',
    name: 'Test Service',
    description: 'Test Description',
    price: 99.99,
  };

  const mockAvailability: Availability = {
    id: 'availability-123',
    service: mockService as Service,
    startAt: new Date('2026-01-25T10:00:00Z'),
    endAt: new Date('2026-01-25T11:00:00Z'),
    isAvailable: true,
  };

  const mockAvailabilityRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockServiceRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvailabilityService,
        {
          provide: getRepositoryToken(Availability),
          useValue: mockAvailabilityRepository,
        },
        {
          provide: getRepositoryToken(Service),
          useValue: mockServiceRepository,
        },
      ],
    }).compile();

    service = module.get<AvailabilityService>(AvailabilityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new availability successfully', async () => {
      const createDto = {
        serviceId: 'service-123',
        startAt: '2026-01-25T10:00:00Z',
        endAt: '2026-01-25T11:00:00Z',
      };

      mockServiceRepository.findOne.mockResolvedValue(mockService);
      mockAvailabilityRepository.create.mockReturnValue(mockAvailability);
      mockAvailabilityRepository.save.mockResolvedValue(mockAvailability);

      const result = await service.create(createDto);

      expect(mockServiceRepository.findOne).toHaveBeenCalledWith({
        where: { id: createDto.serviceId },
      });
      expect(mockAvailabilityRepository.create).toHaveBeenCalled();
      expect(mockAvailabilityRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockAvailability);
    });

    it('should throw NotFoundException if service not found', async () => {
      const createDto = {
        serviceId: 'non-existent',
        startAt: '2026-01-25T10:00:00Z',
        endAt: '2026-01-25T11:00:00Z',
      };

      mockServiceRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all availabilities', async () => {
      const availabilities = [mockAvailability];
      mockAvailabilityRepository.find.mockResolvedValue(availabilities);

      const result = await service.findAll();

      expect(mockAvailabilityRepository.find).toHaveBeenCalledWith({
        relations: ['service'],
      });
      expect(result).toEqual(availabilities);
    });
  });

  describe('findOne', () => {
    it('should return an availability by id', async () => {
      mockAvailabilityRepository.findOne.mockResolvedValue(mockAvailability);

      const result = await service.findOne('availability-123');

      expect(mockAvailabilityRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'availability-123' },
        relations: ['service'],
      });
      expect(result).toEqual(mockAvailability);
    });

    it('should throw NotFoundException if availability not found', async () => {
      mockAvailabilityRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update an availability successfully', async () => {
      const updateDto = {
        startAt: '2026-01-25T12:00:00Z',
        endAt: '2026-01-25T13:00:00Z',
      };
      const updatedAvailability = { ...mockAvailability, ...updateDto };

      mockAvailabilityRepository.findOne.mockResolvedValue(mockAvailability);
      mockAvailabilityRepository.save.mockResolvedValue(updatedAvailability);

      const result = await service.update('availability-123', updateDto);

      expect(mockAvailabilityRepository.findOne).toHaveBeenCalled();
      expect(mockAvailabilityRepository.save).toHaveBeenCalled();
      expect(result).toEqual(updatedAvailability);
    });

    it('should throw NotFoundException if availability not found', async () => {
      mockAvailabilityRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent', { startAt: '2026-01-25T12:00:00Z' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove an availability successfully', async () => {
      mockAvailabilityRepository.findOne.mockResolvedValue(mockAvailability);
      mockAvailabilityRepository.remove.mockResolvedValue(mockAvailability);

      await service.remove('availability-123');

      expect(mockAvailabilityRepository.findOne).toHaveBeenCalled();
      expect(mockAvailabilityRepository.remove).toHaveBeenCalledWith(
        mockAvailability,
      );
    });

    it('should throw NotFoundException if availability not found', async () => {
      mockAvailabilityRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
