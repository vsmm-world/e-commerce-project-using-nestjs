import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaModule } from '../prisma/prisma.module';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const req = {
    user: {
      id: '65a8fa4f41a6ba640657c8df',
    },
  };

  const createUserDto = {
    name: 'Ravindra Valand ',
    email: 'test@gmail.com',
    password: 'R@vi2004',
    role: 'admin',
    default: 'customer',
  };

  const returnedUser = {
    id: '65af9c3515ca634a7f2df713',
    name: 'Ravindra Valand ',
    email: 'test@gmail.com',
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const findAllUser = {
    statusCode: 200,
    message: 'Users fetched successfully',
    admins: [returnedUser], // Include mock user data
    customers: [],
  };

  const updateUserDto = {
    name: 'Ravindra Valand',
    email: 'rvpc792@gmail.com',
  };

  const findOneUser = {
    statusCode: 200,
    message: 'User found successfully',
    user: {
      id: '65a8eb956428edc4d561df7f',
      name: 'Ravindra Valand',
      email: 'rvpc792@gmail.com',
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };
  const report = {
    statusCode: 404,
    message: 'User not found',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useFactory: () => ({
            create: jest.fn().mockResolvedValue(returnedUser),
            findAll: jest.fn().mockResolvedValue(findAllUser),
            findOne: jest.fn().mockResolvedValue(findOneUser),
            update: jest.fn().mockResolvedValue(returnedUser),
            remove: jest.fn().mockResolvedValue(returnedUser),
          }),
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  describe('create', () => {
    it('should return the created admin user', async () => {
      const result = await controller.create(createUserDto);
      expect(result).toEqual(returnedUser);
      expect(userService.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should handle validation error for invalid data', async () => {
      const userlogs = {
        statusCode: 200,
        message: 'This action returns a user',
        data: {
          id: '1',
          name: 'Ravindra Valand',
          email: '',
          password:
            '$2b$10$z0o0n8QaFJQ1n7i7o1tB6uWZB6Xl8h6L1N7Gkz1i1D0wX2kX8vX0i',
          phone: '1234567890',
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
        },
        adminCred: {
          id: '65af9c3515ca634a7f2df714',
          token: '1234567890',
          expiresAt: null,
          adminId: '65af9c3515ca634a7f2df713',
          password:
            '$2b$10$RDkeaZ7nj9gZMPmtNCMVJed9wbKWMzHUG88lMrtO3DdJnoHoK0bZK',
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };
      jest
        .spyOn(userService, 'create')
        .mockImplementation(async () => await userlogs);

      await expect(controller.create(createUserDto)).resolves.toEqual(userlogs);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const result = await controller.findAll(req);
      expect(result).toEqual(findAllUser);
      expect(userService.findAll).toHaveBeenCalledWith(req);
    });

    it('should handle authorization error for unauthenticated user', async () => {
      jest
        .spyOn(userService, 'findAll')
        .mockImplementation(async () => await report);

      await expect(controller.findAll({})).resolves.toEqual(report);
    });
  });

  describe('findOne', () => {
    it('should return a specific user', async () => {
      const userId = '65a8eb956428edc4d561df7f';
      const result = await controller.findOne(userId, req);
      expect(result).toEqual(findOneUser);
      expect(userService.findOne).toHaveBeenCalledWith(userId, req);
    });

    it('should handle not found error for non-existent user ID', async () => {
      const nonExistentUserId = 'nonexistent';
      jest
        .spyOn(userService, 'findOne')
        .mockImplementation(async () => await report);

      await expect(controller.findOne(nonExistentUserId, req)).resolves.toEqual(
        report,
      );
    });
  });

  describe('update', () => {
    it('should return the updated user', async () => {
      const userId = '65a8eb956428edc4d561df7f';
      const result = await controller.update(userId, updateUserDto, req);
      expect(result).toEqual(returnedUser);
      expect(userService.update).toHaveBeenCalledWith(
        userId,
        updateUserDto,
        req,
      );
    });

    it('should handle not found error for non-existent user ID', async () => {
      const nonExistentUserId = 'nonexistent';
      jest
        .spyOn(userService, 'update')
        .mockImplementation(async () => await report);

      await expect(
        controller.update(nonExistentUserId, updateUserDto, req),
      ).resolves.toEqual(report);
    });
  });

  describe('remove', () => {
    it('should return the deleted user', async () => {
      const userId = '65a8eb956428edc4d561df7f';
      const result = await controller.remove(userId, req);
      expect(result).toEqual(returnedUser);
      expect(userService.remove).toHaveBeenCalledWith(userId, req);
    });

    it('should handle not found error for non-existent user ID', async () => {
      const nonExistentUserId = 'nonexistent';
      const report = {
        statusCode: 404,
        message: 'User not found',
      };

      jest
        .spyOn(userService, 'remove')
        .mockImplementation(async () => await report);

      await expect(controller.remove(nonExistentUserId, req)).resolves.toEqual(
        report,
      );
    });
  });
});
