import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const userlogs = {
      statusCode: 200,
      message: 'This action returns a user',
      admin : {
        id: '1',
        name: 'Ravindra Valand',
        email: '',
        password: '$2b$10$z0o0n8QaFJQ1n7i7o1tB6uWZB6Xl8h6L1N7Gkz1i1D0wX2kX8vX0i',
        phone: '1234567890',
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
      },
      adminCred :{
        token : '1234567890',
      }

  }
  const validate = {
    otp: '123456',
    otpRef: '123456',
  };
  const validateReturn = {
    statusCode: 200,
    message: 'This action validate a otp',
    token: '1234567890',
    admin: {
      id: '1',
      name: 'Ravindra Valand',
      email: '',
      password: '$2b$10$z0o0n8QaFJQ1n7i7o1tB6uWZB6Xl8h6L1N7Gkz1i1D0wX2kX8vX0i',
      phone: '1234567890',
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
    },
  };

  const message = [
    {
      statusCode: 200,
      message: 'This action forgot a password',
    },
    {
      statusCode: 200,
      message: 'This action reset a password',
    },

    {
      statusCode: 200,
      message: 'This action login a user',
    },
    {
      statusCode: 200,
      message: 'This action validate a otp',
    },
    {
      statusCode: 200,
      message: 'This action logout a user',
    },
    {
      statusCode: 200,
      message: 'This action returns a user',
    },
  ];
  const req = {
    user: {
      id: '1',
    },
  };
  const resetPass = {
    token: '1234567890',
    password: '1234567890',
    confirPassword: '1234567890',
  };
  const result = {
    id: '1',
    name: 'Ravindra Valand',
    email: '',
    password: '$2b$10$z0o0n8QaFJQ1n7i7o1tB6uWZB6Xl8h6L1N7Gkz1i1D0wX2kX8vX0i',
    phone: '1234567890',
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PrismaModule,
        PassportModule,
        JwtModule.register({
          secret: 'RavindraValand',
          signOptions: { expiresIn: '1d' },
        }),
      ],
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            resetPassword: jest
              .fn()
              .mockResolvedValue('This action reset a password'),
            forgotPassword: jest
              .fn()
              .mockResolvedValue('This action forgot a password'),
            whoami: jest.fn().mockResolvedValue('This action returns a user'),
            login: jest.fn().mockResolvedValue('This action login a user'),
            validateOtp: jest
              .fn()
              .mockResolvedValue('This action validate a otp'),
            logout: jest.fn().mockResolvedValue('This action logout a user'),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('forgotPassword', () => {
    it('should return "This action forgot a password"', async () => {
      jest
        .spyOn(controller, 'forgotPassword')
        .mockImplementation(async () => message[0]);

      expect(await controller.forgotPassword({ email: '' })).toBe(message[0]);
      expect(controller.forgotPassword).toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should return "This action reset a password"', async () => {
      jest
        .spyOn(controller, 'resetPassword')
        .mockImplementation(async () => message[1]);
      expect(await controller.resetPassword(resetPass)).toBe(message[1]);
      expect(controller.resetPassword).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return "This action login a user"', async () => {
      jest
        .spyOn(controller, 'login')
        .mockImplementation(async () => message[2]);
      expect(await controller.login(result)).toBe(message[2]);
      expect(controller.login).toHaveBeenCalled();
    });
  });

  describe('validateOtp', () => {
    it('should return "This action validate a otp"', async () => {
      jest
        .spyOn(controller, 'validateOtp')
        .mockImplementation(async () => validateReturn);
      expect(await controller.validateOtp(validate)).toBe(validateReturn);
      expect(controller.validateOtp).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should return "This action logout a user"', async () => {
      jest
        .spyOn(controller, 'logout')
        .mockImplementation(async () => message[4]);
      expect(await controller.logout(req)).toBe(message[4]);
      expect(controller.logout).toHaveBeenCalled();
    });
  });

  describe('whoami', () => {
    it('should return "This action returns a user"', async () => {
      jest
        .spyOn(controller, 'whoami')
        .mockImplementation(async () => message[5]);
      expect(await controller.whoami(req)).toBe(message[5]);
      expect(controller.whoami).toHaveBeenCalled();
    });
  });
});
