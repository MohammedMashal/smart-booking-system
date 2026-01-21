import { Test, TestingModule } from '@nestjs/testing';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { Service } from './service.entity';
import { User } from 'src/users/user.entity';

describe('ServicesController', () => {
  let controller: ServicesController;

  const mockService: Service = {
    id: '1',
    name: 'Test Service',
    description: 'Test Description',
    price: 99.99,
    capacity: 10,
    owner: {
      id: 'user-123',
      name: 'John Doe',
      email: 'john@example.com',
    } as User,
    availabilities: [],
    bookings: [],
  };

  const mockServicesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockRequest = {
    user: {
      id: 'user-123',
      email: 'john@example.com',
    } as User,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServicesController],
      providers: [
        {
          provide: ServicesService,
          useValue: mockServicesService,
        },
      ],
    }).compile();

    controller = module.get<ServicesController>(ServicesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new service', async () => {
      const createDto = {
        name: 'Test Service',
        description: 'Test Description',
        price: 99.99,
        capacity: 10,
      };

      mockServicesService.create.mockResolvedValue(mockService);

      const result = await controller.create(createDto, mockRequest);

      expect(mockServicesService.create).toHaveBeenCalledWith(
        createDto,
        'user-123',
      );
      expect(result).toEqual(mockService);
    });
  });

  describe('findAll', () => {
    it('should return all services', async () => {
      const services = [mockService];
      mockServicesService.findAll.mockResolvedValue(services);

      const result = await controller.findAll();

      expect(mockServicesService.findAll).toHaveBeenCalled();
      expect(result).toEqual(services);
    });
  });

  describe('findOne', () => {
    it('should return a service by id', async () => {
      mockServicesService.findOne.mockResolvedValue(mockService);

      const result = await controller.findOne('1');

      expect(mockServicesService.findOne).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockService);
    });
  });

  describe('update', () => {
    it('should update a service', async () => {
      const updateDto = { name: 'Updated Service' };
      const updatedService = { ...mockService, ...updateDto };

      mockServicesService.update.mockResolvedValue(updatedService);

      const result = await controller.update('1', updateDto, mockRequest);

      expect(mockServicesService.update).toHaveBeenCalledWith(
        '1',
        updateDto,
        'user-123',
      );
      expect(result).toEqual(updatedService);
    });
  });

  describe('remove', () => {
    it('should delete a service', async () => {
      mockServicesService.remove.mockResolvedValue(undefined);

      await controller.remove('1', mockRequest);

      expect(mockServicesService.remove).toHaveBeenCalledWith('1', 'user-123');
    });
  });
});
