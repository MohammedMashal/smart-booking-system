import { Test, TestingModule } from '@nestjs/testing';
import { BookingsService } from './bookings.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Booking } from './booking.entity';
import { DataSource } from 'typeorm';
import { ServicesService } from 'src/services/services.service';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { BookingStatus } from './types/booking-status.enum';
import { User } from 'src/users/user.entity';
import { Service } from 'src/services/service.entity';
import { Availability } from 'src/availability/availability.entity';

describe('BookingsService', () => {
  let service: BookingsService;

  const mockBooking: Booking = {
    id: 'booking-123',
    user: {
      id: 'user-123',
      name: 'John Doe',
      email: 'john@example.com',
    } as User,
    service: {
      id: 'service-123',
      name: 'Test Service',
    } as Service,
    availability: {
      id: 'availability-123',
      isAvailable: false,
    } as Availability,
    status: BookingStatus.PENDING,
    createdAt: new Date(),
  };

  const mockRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockManager = {
    findOneOrFail: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  const mockDataSource = {
    transaction: jest.fn(),
  };

  const mockServicesService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        {
          provide: getRepositoryToken(Booking),
          useValue: mockRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: ServicesService,
          useValue: mockServicesService,
        },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new booking successfully', async () => {
      const createDto = {
        serviceId: 'service-123',
        availabilityId: 'availability-123',
      };

      const availability = {
        id: 'availability-123',
        isAvailable: true,
      };

      mockServicesService.findOne.mockResolvedValue({
        id: 'service-123',
        name: 'Test Service',
      });

      mockDataSource.transaction.mockImplementation(
        async (cb: (manager: any) => Promise<Booking>) => {
          mockManager.findOneOrFail.mockResolvedValue(availability);
          mockManager.create.mockReturnValue(mockBooking);
          mockManager.save.mockResolvedValue(mockBooking);
          return await cb(mockManager);
        },
      );

      const result = await service.create(createDto, 'user-123');

      expect(mockServicesService.findOne).toHaveBeenCalledWith('service-123');
      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(result).toEqual(mockBooking);
    });

    it('should throw ConflictException if availability is already booked', async () => {
      const createDto = {
        serviceId: 'service-123',
        availabilityId: 'availability-123',
      };

      const availability = {
        id: 'availability-123',
        isAvailable: false,
      };

      mockServicesService.findOne.mockResolvedValue({
        id: 'service-123',
      });

      mockDataSource.transaction.mockImplementation(
        async (cb: (manager: any) => Promise<Booking>) => {
          mockManager.findOneOrFail.mockResolvedValue(availability);
          return await cb(mockManager);
        },
      );

      await expect(service.create(createDto, 'user-123')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('cancel', () => {
    it('should cancel a booking successfully', async () => {
      const bookingWithAvailability = {
        ...mockBooking,
        availability: {
          id: 'availability-123',
          isAvailable: false,
        },
      };

      mockRepository.findOne.mockResolvedValue(bookingWithAvailability);

      mockDataSource.transaction.mockImplementation(
        async (cb: (manager: any) => Promise<Booking>) => {
          mockManager.save.mockResolvedValue({
            ...bookingWithAvailability,
            status: BookingStatus.CANCELLED,
          });
          return cb(mockManager);
        },
      );

      const result = await service.cancel('booking-123', 'user-123');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'booking-123' },
        relations: ['user', 'availability'],
      });
      expect(result.status).toEqual(BookingStatus.CANCELLED);
    });

    it('should throw NotFoundException if booking not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.cancel('non-existent', 'user-123')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw UnauthorizedException if user is not the owner', async () => {
      mockRepository.findOne.mockResolvedValue(mockBooking);

      await expect(
        service.cancel('booking-123', 'different-user'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('findAllByUser', () => {
    it('should return all bookings for a user', async () => {
      const bookings = [mockBooking];
      mockRepository.find.mockResolvedValue(bookings);

      const result = await service.findAllByUser('user-123');

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { user: { id: 'user-123' } },
        relations: ['service', 'availability'],
      });
      expect(result).toEqual(bookings);
    });
  });

  describe('findOneByUser', () => {
    it('should return a booking by id for a user', async () => {
      mockRepository.findOne.mockResolvedValue(mockBooking);

      const result = await service.findOneByUser('booking-123', 'user-123');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'booking-123', user: { id: 'user-123' } },
        relations: ['service', 'availability'],
      });
      expect(result).toEqual(mockBooking);
    });

    it('should throw NotFoundException if booking not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOneByUser('non-existent', 'user-123'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
