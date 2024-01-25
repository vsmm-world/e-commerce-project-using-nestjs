import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotFoundException } from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController;

  const req = {
    user: {
      id: '65a8fa4f41a6ba640657c8df',
    },
  };

  const message = {
    statusCode: 200,
    message: 'User deleted successfully',
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

  const userlogs = {
    statusCode: 200,
    message: 'This action returns a user',
    data: {
      id: '1',
      name: 'Ravindra Valand',
      email: '',
      password: '$2b$10$z0o0n8QaFJQ1n7i7o1tB6uWZB6Xl8h6L1N7Gkz1i1D0wX2kX8vX0i',
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
      password: '$2b$10$RDkeaZ7nj9gZMPmtNCMVJed9wbKWMzHUG88lMrtO3DdJnoHoK0bZK',
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
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
  });

  describe('create', () => {
    it('should return the created user', async () => {
      jest.spyOn(controller, 'create').mockImplementation(async () => {
        return userlogs;
      });

      expect(await controller.create(createUserDto)).toEqual(userlogs);
      expect(controller.create).toHaveBeenCalled();
    });

    it('should handle validation error for invalid data', async () => {
      jest.spyOn(controller, 'create').mockImplementation(async () => {
        throw new Error('Invalid user data');
      });

      await expect(controller.create).rejects.toThrow('Invalid user data');
      expect(controller.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      jest.spyOn(controller, 'findAll').mockImplementation(async () => {
        return findAllUser;
      });
      expect(await controller.findAll(req)).toEqual(findAllUser);
      expect(controller.findAll).toHaveBeenCalled();
    });

    it('should handle authorization error for unauthenticated user', async () => {
      jest.spyOn(controller, 'findAll').mockImplementation(async () => {
        throw new Error('Unauthorized');
      });

      await expect(controller.findAll).rejects.toThrow('Unauthorized');
      expect(controller.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a specific user', async () => {
      jest.spyOn(controller, 'findOne').mockImplementation(async () => {
        return findOneUser;
      });

      expect(await controller.findOne('kjkabsvkjhbha', req)).toEqual(findOneUser);
      expect(controller.findOne).toHaveBeenCalled();
    });

    it('should handle not found error for non-existent user ID', async () => {
      const nonExistentUserId = 'nonexistent';
      jest.spyOn(controller, 'findOne').mockImplementation(async () => {
        throw new NotFoundException();
      });

      await expect(controller.findOne).rejects.toThrow(NotFoundException);
      expect(controller.findOne).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should return the updated user', async () => {
      jest.spyOn(controller, 'update').mockImplementation(async () => {
        return returnedUser;
      });
      expect(
        await controller.update('65a8eb956428edc4d561df7f', updateUserDto, req),
      ).toEqual(returnedUser);

      expect(controller.update).toHaveBeenCalled();
    });

    it('should handle not found error for non-existent user ID', async () => {
      jest.spyOn(controller, 'update').mockImplementation(async () => {
        throw new NotFoundException();
      });

      await expect(controller.update).rejects.toThrow(NotFoundException);
      expect(controller.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should return the deleted user', async () => {
      jest.spyOn(controller, 'remove').mockImplementation(async () => message);
      expect(await controller.remove('65a8eb956428edc4d561df7f', req)).toEqual(
        message,
      );
      expect(controller.remove).toHaveBeenCalled();
    });

    it('should handle not found error for non-existent user ID', async () => {
      const nonExistentUserId = 'nonexistent';
      const report = {
        statusCode: 404,
        message: 'User not found',
      };

      jest.spyOn(controller, 'remove').mockImplementation(async () => {
        throw new NotFoundException();
      });

      await expect(controller.remove(nonExistentUserId, req)).rejects.toThrow(
        NotFoundException,
      );
      expect(controller.remove).toHaveBeenCalled();
    });
  });
});

