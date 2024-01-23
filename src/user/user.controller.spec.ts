import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaModule } from '../prisma/prisma.module';

describe('UserController', () => {
  let controller: UserController;

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
    statusCode: 200,
    message: 'Admin created successfully',
    data: {
      id: '65af9c3515ca634a7f2df713',
      name: 'Ravindra Valand ',
      email: 'test@gmail.com',
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    adminCred: {
      id: '65af9c3515ca634a7f2df714',
      adminId: '65af9c3515ca634a7f2df713',
      token: null,
      expiresAt: null,
      password: '$2b$10$RDkeaZ7nj9gZMPmtNCMVJed9wbKWMzHUG88lMrtO3DdJnoHoK0bZK',
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  const findAllUser = {
    statusCode: 200,
    message: 'Users fetched successfully',
    admins: [],
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
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            create: jest.fn().mockResolvedValue('This action adds a new user'),
            findAll: jest
              .fn()
              .mockResolvedValue('This action returns all user'),
            findOne: jest
              .fn()
              .mockResolvedValue('This action returns a #${id} user'),
            update: jest
              .fn()
              .mockResolvedValue('This action updates a #${id} user'),
            remove: jest
              .fn()
              .mockResolvedValue('This action removes a #${id} user'),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  describe('create', () => {
    it('should return "Admin created successfully"', async () => {
      jest.spyOn(controller, 'create').mockResolvedValue(returnedUser);
      expect(await controller.create(createUserDto)).toBe(returnedUser);
      expect(controller.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all user', async () => {
      jest.spyOn(controller, 'findAll').mockResolvedValue(findAllUser);
      expect(await controller.findAll(req)).toBe(findAllUser);
      expect(controller.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user', async () => {
      jest.spyOn(controller, 'findOne').mockResolvedValue(findOneUser);
      expect(await controller.findOne('65a8eb956428edc4d561df7f', req)).toBe(
        findOneUser,
      );
      expect(controller.findOne).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should return updated user', async () => {
      jest.spyOn(controller, 'update').mockResolvedValue(returnedUser);
      expect(
        await controller.update('65a8eb956428edc4d561df7f', updateUserDto, req),
      ).toBe(returnedUser);
      expect(controller.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should return "User deleted successfully"', async () => {
      jest.spyOn(controller, 'remove').mockResolvedValue(returnedUser);
      expect(await controller.remove('65a8eb956428edc4d561df7f', req)).toBe(
        returnedUser,
      );
      expect(controller.remove).toHaveBeenCalled();
    });
  });
});
