import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRole } from './types/user-role.enum';
import { User } from './user.entity';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUser: User = {
    id: '1',
    name: 'Mohammed',
    email: 'mohammed@example.com',
    password: '123456789',
    role: UserRole.CUSTOMER,
    refreshToken: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    services: [],
    bookings: [],
  };

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        name: 'Mohammed',
        email: 'mohammed@example.com',
        password: '123456789',
      };

      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await controller.createUser(createUserDto);

      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const users = [mockUser];
      mockUsersService.findAll.mockResolvedValue(users);

      const result = await controller.getAllUsers();

      expect(mockUsersService.findAll).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });

  describe('getUserById', () => {
    it('should return a user by id', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.getUserById(mockUser.id);

      expect(mockUsersService.findOne).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateUserById', () => {
    it('should update a user', async () => {
      const updateUserDto = { name: 'Mohammed' };
      const updatedUser = { ...mockUser, ...updateUserDto };

      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.updateUserById(
        mockUser.id,
        updateUserDto,
      );

      expect(mockUsersService.update).toHaveBeenCalledWith(
        mockUser.id,
        updateUserDto,
      );
      expect(result).toEqual(updatedUser);
    });
  });

  describe('deleteUserById', () => {
    it('should delete a user', async () => {
      const deleteResult = { affected: 1 };
      mockUsersService.remove.mockResolvedValue(deleteResult);

      const result = await controller.deleteUserById(mockUser.id);

      expect(mockUsersService.remove).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(deleteResult);
    });
  });
});
