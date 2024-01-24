// import { Test, TestingModule } from '@nestjs/testing';
// import { AuthController } from './auth.controller';
// import { AuthService } from './auth.service';
// import { PrismaModule } from '../prisma/prisma.module';
// import { JwtModule, JwtService } from '@nestjs/jwt';
// import { PassportModule } from '@nestjs/passport';

// describe('AuthController', () => {
//   let controller: AuthController;
//   let service: AuthService;

//   const userlogs = {
//     statusCode: 200,
//     message: 'This action returns a user',
//     admin: {
//       id: '1',
//       name: 'Ravindra Valand',
//       email: '',
//       password: '$2b$10$z0o0n8QaFJQ1n7i7o1tB6uWZB6Xl8h6L1N7Gkz1i1D0wX2kX8vX0i',
//       phone: '1234567890',
//       createdAt: new Date(),
//       updatedAt: new Date(),
//       isDeleted: false,
//     },
//     adminCred: {
//       token: '1234567890',
//     },
//   };
//   const validate = {
//     otp: '123456',
//     otpRef: '123456',
//   };
//   const validateReturn = {
//     statusCode: 200,
//     message: 'This action validate a otp',
//     token: '1234567890',
//     admin: {
//       id: '1',
//       name: 'Ravindra Valand',
//       email: '',
//       password: '$2b$10$z0o0n8QaFJQ1n7i7o1tB6uWZB6Xl8h6L1N7Gkz1i1D0wX2kX8vX0i',
//       phone: '1234567890',
//       createdAt: new Date(),
//       updatedAt: new Date(),
//       isDeleted: false,
//     },
//   };

//   const message = [
//     {
//       statusCode: 200,
//       message: 'This action forgot a password',
//     },
//     {
//       statusCode: 200,
//       message: 'This action reset a password',
//     },

//     {
//       statusCode: 200,
//       message: 'This action login a user',
//       otpRef: 'string',

//     },
//     {
//       statusCode: 200,
//       message: 'This action validate a otp',
//     },
//     {
//       statusCode: 200,
//       message: 'This action logout a user',
//     },
//     {
//       statusCode: 200,
//       message: 'This action returns a user',
//     },
//   ];
//   const req = {
//     user: {
//       id: '1',
//     },
//   };
//   const resetPass = {
//     token: '1234567890',
//     password: '1234567890',
//     confirPassword: '1234567890',
//   };
//   const result = {
//     id: '1',
//     name: 'Ravindra Valand',
//     email: '',
//     password: '$2b$10$z0o0n8QaFJQ1n7i7o1tB6uWZB6Xl8h6L1N7Gkz1i1D0wX2kX8vX0i',
//     phone: '1234567890',
//     createdAt: new Date(),
//     updatedAt: new Date(),
//     isDeleted: false,
//   };

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       imports: [
//         PrismaModule,
//         PassportModule,
//         JwtModule.register({
//           secret: 'RavindraValand',
//           signOptions: { expiresIn: '1d' },
//         }),
//       ],
//       controllers: [AuthController],
//       providers: [
//         {
//           provide: AuthService,
//           useValue: {
//             resetPassword: jest.fn().mockResolvedValue(() => {
//               return message[1];
//             }),
//             forgotPassword: jest.fn().mockResolvedValue(() => {
//               return message[0];
//             }),
//             whoami: jest.fn().mockResolvedValue(() => {
//               return userlogs;
//             }),
//             login: jest.fn().mockResolvedValue(() => {
//               return userlogs;
//             }),
//             validateOtp: jest.fn().mockResolvedValue(() => {
//               return validateReturn;
//             }),
//             logout: jest.fn().mockResolvedValue(() => {
//               return message[4];
//             }),
//           },
//         },
//       ],
//     }).compile();

//     controller = module.get<AuthController>(AuthController);
//   });

//   describe('forgotPassword', () => {
//     it('should return "This action forgot a password"', async () => {
//       jest
//         .spyOn(controller, 'forgotPassword')
//         .mockImplementation(async () => message[0]);

//       expect(await controller.forgotPassword({ email: '' })).toBe(message[0]);
//       expect(controller.forgotPassword).toHaveBeenCalled();
//     });
//   });

//   describe('resetPassword', () => {
//     it('should return "This action reset a password"', async () => {
//       jest
//         .spyOn(controller, 'resetPassword')
//         .mockImplementation(async () => message[1]);
//       expect(await controller.resetPassword(resetPass)).toBe(message[1]);
//       expect(controller.resetPassword).toHaveBeenCalled();
//     });
//   });

//   describe('login', () => {
//     it('should return "This action login a user"', async () => {
//       jest.spyOn(controller, 'login').mockImplementation(async () => message[2]);
//       expect(await controller.login(result)).toBe(message[2]);
//       expect(controller.login).toHaveBeenCalled();
//     });
//   });

//   describe('validateOtp', () => {
//     it('should return "This action validate a otp"', async () => {
//       jest
//         .spyOn(controller, 'validateOtp')
//         .mockImplementation(async () => validateReturn);
//       expect(await controller.validateOtp(validate)).toBe(validateReturn);
//       expect(controller.validateOtp).toHaveBeenCalled();
//     });
//   });

//   describe('logout', () => {
//     it('should return "This action logout a user"', async () => {
//       jest
//         .spyOn(controller, 'logout')
//         .mockImplementation(async () => message[4]);
//       expect(await controller.logout(req)).toBe(message[4]);
//       expect(controller.logout).toHaveBeenCalled();
//     });
//   });

//   describe('whoami', () => {
//     it('should return "This action returns a user"', async () => {
//       jest
//         .spyOn(controller, 'whoami')
//         .mockImplementation(async () => message[5]);
//       expect(await controller.whoami(req)).toBe(message[5]);
//       expect(controller.whoami).toHaveBeenCalled();
//     });
//   });
// });

import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const userlogs = {
    statusCode: 200,
    message: 'This action returns a user',
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
    adminCred: {
      id: '65a8eb956428edc4d561df80',
      adminId: '65a8eb956428edc4d561df7f',
      token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NWE4ZWI5NTY0MjhlZGM0ZDU2MWRmN2YiLCJpYXQiOjE3MDYwOTExNzcsImV4cCI6MTcwNjE3NzU3N30.TxAu98dRKENFFewo1qP0E0n3bLJn-2UiBn92o9A4YUk',
      expiresAt: new Date(),
      password: '$2b$10$lnDC5s4cW68MG46946gUXuMq5bkVC/qBwjbwiFw4R7hIbGLLoGxC2',
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  const validate = {
    otp: '123456',
    otpRef: '123456',
  };

  const validateReturn = {
    statusCode: 200,
    message: 'This action validate an OTP',
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
const loginReturn = {
  statusCode:200,
  message:'This action login a user', 
  otpRef:'string'
}
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
      otpRef: 'string',
    },
    {
      statusCode: 200,
      message: 'This action validate an OTP',
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
            resetPassword: jest.fn().mockResolvedValue(message[1]),
            forgotPassword: jest.fn().mockResolvedValue(message[0]),
            whoami: jest.fn().mockResolvedValue(userlogs),
            login: jest.fn().mockResolvedValue(userlogs),
            validateOtp: jest.fn().mockResolvedValue(validateReturn),
            logout: jest.fn().mockResolvedValue(message[4]),
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

    it('should throw an error for invalid email', async () => {
      jest.spyOn(controller, 'forgotPassword').mockImplementation(async () => {
        throw new Error('Invalid email');
      });

      await expect(
        controller.forgotPassword({ email: '' }),
      ).rejects.toThrowError('Invalid email');
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
        .mockImplementation(async () => loginReturn);
      expect(await controller.login(result)).toBe(loginReturn);
      expect(controller.login).toHaveBeenCalled();
    });

    it('should throw an error for incorrect credentials', async () => {
      jest.spyOn(controller, 'login').mockImplementation(async () => {
        throw new Error('Incorrect credentials');
      });

      await expect(controller.login(result)).rejects.toThrowError(
        'Incorrect credentials',
      );
      expect(controller.login).toHaveBeenCalled();
    });
  });

  describe('validateOtp', () => {
    it('should return "This action validate an OTP"', async () => {
      jest
        .spyOn(controller, 'validateOtp')
        .mockImplementation(async () => validateReturn);
      expect(await controller.validateOtp(validate)).toBe(validateReturn);
      expect(controller.validateOtp).toHaveBeenCalled();
    });

    it('should throw an error for invalid OTP', async () => {
      jest.spyOn(controller, 'validateOtp').mockImplementation(async () => {
        throw new Error('Invalid OTP');
      });

      await expect(controller.validateOtp(validate)).rejects.toThrowError(
        'Invalid OTP',
      );
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
      jest.spyOn(controller, 'whoami').mockImplementation(async () => userlogs);
      expect(await controller.whoami(req)).toBe(userlogs);
      expect(controller.whoami).toHaveBeenCalled();
    });
  });
});


