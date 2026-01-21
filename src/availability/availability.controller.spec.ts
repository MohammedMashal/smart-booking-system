import { Test, TestingModule } from '@nestjs/testing';
import { AvailabilityController } from './availability.controller';
import { AvailabilityService } from './availability.service';
import { Availability } from './availability.entity';
import { Service } from 'src/services/service.entity';

describe('AvailabilityController', () => {
  let controller: AvailabilityController;

  const mockAvailability: Availability = {
    id: 'availability-123',
    service: {
      id: 'service-123',
      name: 'Test Service',
    } as Service,
    startAt: new Date('2026-01-25T10:00:00Z'),
    endAt: new Date('2026-01-25T11:00:00Z'),
    isAvailable: true,
  };

  const mockAvailabilityService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AvailabilityController],
      providers: [
        {
          provide: AvailabilityService,
          useValue: mockAvailabilityService,
        },
      ],
    }).compile();

    controller = module.get<AvailabilityController>(AvailabilityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new availability', async () => {
      const createDto = {
        serviceId: 'service-123',
        startAt: '2026-01-25T10:00:00Z',
        endAt: '2026-01-25T11:00:00Z',
      };

      mockAvailabilityService.create.mockResolvedValue(mockAvailability);

      const result = await controller.create(createDto);

      expect(mockAvailabilityService.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockAvailability);
    });
  });

  describe('findAll', () => {
    it('should return all availabilities', async () => {
      const availabilities = [mockAvailability];
      mockAvailabilityService.findAll.mockResolvedValue(availabilities);

      const result = await controller.findAll();

      expect(mockAvailabilityService.findAll).toHaveBeenCalled();
      expect(result).toEqual(availabilities);
    });
  });

  describe('findOne', () => {
    it('should return an availability by id', async () => {
      mockAvailabilityService.findOne.mockResolvedValue(mockAvailability);

      const result = await controller.findOne('availability-123');

      expect(mockAvailabilityService.findOne).toHaveBeenCalledWith(
        'availability-123',
      );
      expect(result).toEqual(mockAvailability);
    });
  });

  describe('update', () => {
    it('should update an availability', async () => {
      const updateDto = {
        startAt: '2026-01-25T12:00:00Z',
        endAt: '2026-01-25T13:00:00Z',
      };
      const updatedAvailability = { ...mockAvailability, ...updateDto };

      mockAvailabilityService.update.mockResolvedValue(updatedAvailability);

      const result = await controller.update('availability-123', updateDto);

      expect(mockAvailabilityService.update).toHaveBeenCalledWith(
        'availability-123',
        updateDto,
      );
      expect(result).toEqual(updatedAvailability);
    });
  });

  describe('remove', () => {
    it('should delete an availability', async () => {
      mockAvailabilityService.remove.mockResolvedValue(mockAvailability);

      await controller.remove('availability-123');

      expect(mockAvailabilityService.remove).toHaveBeenCalledWith(
        'availability-123',
      );
    });
  });
});
