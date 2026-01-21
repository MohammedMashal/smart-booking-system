import { Test, TestingModule } from '@nestjs/testing';
import { ServicesService } from './services.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Service } from './service.entity';
import { User } from '../users/user.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('ServicesService', () => {
  let service: ServicesService;

  const mockService: Service = {
    id: '1',
    name: 'Test Service',
    description: 'Test Description',
    price: 99.99,
    capacity: 10,
    owner: {
      id: '5',
      name: 'Ahmed',
      email: 'ahmed@example.com',
    } as User,
    availabilities: [],
    bookings: [],
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicesService,
        {
          provide: getRepositoryToken(Service),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ServicesService>(ServicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new service', async () => {
      const createDto = {
        name: 'Test Service',
        description: 'Test Description',
        price: 99.99,
        capacity: 10,
      };

      mockRepository.create.mockReturnValue(mockService);
      mockRepository.save.mockResolvedValue(mockService);

      const result = await service.create(createDto, '5');

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createDto,
        owner: { id: '5' },
      });
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockService);
    });
  });

  describe('findAll', () => {
    it('should return all services', async () => {
      const services = [mockService];
      mockRepository.find.mockResolvedValue(services);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({
        relations: ['owner'],
      });
      expect(result).toEqual(services);
    });
  });

  describe('findOne', () => {
    it('should return a service by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockService);

      const result = await service.findOne('1');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'service-123' },
        relations: ['owner'],
      });
      expect(result).toEqual(mockService);
    });

    it('should throw NotFoundException if service not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a service successfully', async () => {
      const updateDto = { name: 'Updated Service' };
      const updatedService = { ...mockService, ...updateDto };

      mockRepository.findOne.mockResolvedValue(mockService);
      mockRepository.save.mockResolvedValue(updatedService);

      const result = await service.update('1', updateDto, '5');

      expect(mockRepository.findOne).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result.name).toEqual(updateDto.name);
    });

    it('should throw ForbiddenException if user is not the owner', async () => {
      mockRepository.findOne.mockResolvedValue(mockService);

      await expect(
        service.update('1', { name: 'Updated' }, 'different-user'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if service not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent', { name: 'Updated' }, '5'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a service successfully', async () => {
      mockRepository.findOne.mockResolvedValue(mockService);
      mockRepository.remove.mockResolvedValue(mockService);

      await service.remove('1', '5');

      expect(mockRepository.findOne).toHaveBeenCalled();
      expect(mockRepository.remove).toHaveBeenCalledWith(mockService);
    });

    it('should throw ForbiddenException if user is not the owner', async () => {
      mockRepository.findOne.mockResolvedValue(mockService);

      await expect(service.remove('1', 'different-user')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException if service not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent', '5')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
