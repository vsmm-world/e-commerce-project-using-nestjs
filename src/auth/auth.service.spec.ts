import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;

  const userLogs = {
    statusCode: 200,
    message: 'This action returns a user',
    admin: {
      id: '1',
      name: 'Ravindra Valand',
      email: '',
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    adminCred: {
      id: '1',
      adminId: '1',
      token: '1234567890',
      expiresAt: new Date(),
      password: '$2b$10$z0o0n8QaFJQ1n7i7o1tB6uWZB6Xl8h6L1N7Gkz1i1D0wX2kX8vX0i',
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
    },
  };
  const logs = {
    email: '',
    password: '',
  };
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

    service = module.get<AuthService>(AuthService);
  });

  describe('forgotPassword', () => {
    it('should return "This action forgot a password"', async () => {
      jest
        .spyOn(service, 'forgotPassword')
        .mockImplementation(async () => message[0]);

      expect(await service.forgotPassword({ email: '' })).toBe(message[0]);
      expect(service.forgotPassword).toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should return "This action reset a password"', async () => {
      jest
        .spyOn(service, 'resetPassword')
        .mockImplementation(async () => message[1]);

      expect(await service.resetPassword(resetPass)).toBe(message[1]);
      expect(service.resetPassword).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return "This action login a user"', async () => {
      jest.spyOn(service, 'login').mockImplementation(async () => message[2]);

      expect(await service.login(logs)).toEqual(message[2]);
      expect(service.login).toHaveBeenCalled();
    });
  });

  describe('validateOtp', () => {
    it('should return "This action validate a otp"', async () => {
      jest
        .spyOn(service, 'validateOtp')
        .mockImplementation(async () => validateReturn);

      expect(await service.validateOtp(validate)).toEqual(validateReturn);
      expect(service.validateOtp).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should return "This action logout a user"', async () => {
      jest.spyOn(service, 'logout').mockImplementation(async () => message[4]);

      expect(await service.logout(req)).toEqual(message[4]);
      expect(service.logout).toHaveBeenCalled();
    });
  });

  describe('whoami', () => {
    it('should return "This action returns a user"', async () => {
      jest.spyOn(service, 'whoami').mockImplementation(async () => userLogs);

      expect(await service.whoami(req)).toEqual(userLogs);
      expect(service.whoami).toHaveBeenCalled();
    });
  });
});
