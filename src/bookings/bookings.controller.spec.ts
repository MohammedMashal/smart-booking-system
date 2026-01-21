import { Test, TestingModule } from '@nestjs/testing';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { Booking } from './booking.entity';
import { BookingStatus } from './types/booking-status.enum';
import { User } from 'src/users/user.entity';
import { Service } from 'src/services/service.entity';
import { Availability } from 'src/availability/availability.entity';

describe('BookingsController', () => {
  let controller: BookingsController;

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

  const mockBookingsService = {
    create: jest.fn(),
    cancel: jest.fn(),
    findAllByUser: jest.fn(),
    findOneByUser: jest.fn(),
  };

  const mockRequest = {
    user: {
      id: 'user-123',
      email: 'john@example.com',
    } as User,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingsController],
      providers: [
        {
          provide: BookingsService,
          useValue: mockBookingsService,
        },
      ],
    }).compile();

    controller = module.get<BookingsController>(BookingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new booking', async () => {
      const createDto = {
        serviceId: 'service-123',
        availabilityId: 'availability-123',
      };

      mockBookingsService.create.mockResolvedValue(mockBooking);

      const result = await controller.create(createDto, mockRequest);

      expect(mockBookingsService.create).toHaveBeenCalledWith(
        createDto,
        'user-123',
      );
      expect(result).toEqual(mockBooking);
    });
  });

  describe('cancel', () => {
    it('should cancel a booking', async () => {
      const cancelledBooking = {
        ...mockBooking,
        status: BookingStatus.CANCELLED,
      };

      mockBookingsService.cancel.mockResolvedValue(cancelledBooking);

      const result = await controller.cancel('booking-123', mockRequest);

      expect(mockBookingsService.cancel).toHaveBeenCalledWith(
        'booking-123',
        'user-123',
      );
      expect(result).toEqual(cancelledBooking);
    });
  });

  describe('findAll', () => {
    it('should return all bookings for a user', async () => {
      const bookings = [mockBooking];
      mockBookingsService.findAllByUser.mockResolvedValue(bookings);

      const result = await controller.findAll(mockRequest);

      expect(mockBookingsService.findAllByUser).toHaveBeenCalledWith(
        'user-123',
      );
      expect(result).toEqual(bookings);
    });
  });

  describe('findOne', () => {
    it('should return a booking by id', async () => {
      mockBookingsService.findOneByUser.mockResolvedValue(mockBooking);

      const result = await controller.findOne('booking-123', mockRequest);

      expect(mockBookingsService.findOneByUser).toHaveBeenCalledWith(
        'booking-123',
        'user-123',
      );
      expect(result).toEqual(mockBooking);
    });
  });
});
