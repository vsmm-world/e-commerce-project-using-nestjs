import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RazorpayModule } from 'nestjs-razorpay';

describe('PaymentController', () => {
  let controller: PaymentController;
  const req = {
    user: {
      id: '1',
    },
  };

  const bynowCred = {
    ProductVariantId: '65a8fb7f41a6ba640657c8e1',
    quantity: 5,
    CashOnDelivery: true,
    currency: 'INR',
  };
  const bynowReturned = {
    statusCode: 200,
    message: 'Payment created successfully',
    data: {
      info: 'CashOnDelivery',
    },
    order: {
      id: '65af8a36b3954d905bb6705e',
      productIds: ['65a8fb7f41a6ba640657c8e1'],
      products: [],
      customerId: '65a8fc4441a6ba640657c8e3',
      tatalItems: 5,
      totalPrice: 275,
      paymentId: '65af8a36b3954d905bb6705d',
      paymentMethod: 'CashOnDelivery',
      paymentStatus: 'Pending',
      orderDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
    },
  };
  const cred = {
    CashOnDelivery: true,
    currency: 'INR',
  };
  const returnedData = {
    statusCode: 200,
    message: 'Payment created successfullyrazorpay',
    data: {
      info: 'CashOnDelivery',
    },
    order: {
      data: {
        id: '65af8676c26faea42148c2d5',
        productIds: ['65a8fb6141a6ba640657c8e0'],
        products: [],
        customerId: '65a8fc4441a6ba640657c8e3',
        tatalItems: 1,
        totalPrice: 50,
        paymentId: '65a9015c44978d4e56bb34d8',
        paymentMethod: 'Online',
        paymentStatus: 'Paid',
        orderDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
      },
      shippmentstatus: {
        id: '65af8677c26faea42148c2d6',
        status: 'Pending',
        createdAt: new Date(),
        updatedAt: new Date(),
        addressId: '65a8fe87287c099be96092a6',
        orderId: '65af8676c26faea42148c2d5',
        isDeleted: false,
      },
      payment: {
        id: '65a9015c44978d4e56bb34d8',
        COD: false,
        pymentCred: '',
        customerId: '65a8fc4441a6ba640657c8e3',
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
      },
    },
  };

  const message = [
    {
      statusCode: 200,
      message: 'This action returns all payment',
      data: [
        {
          id: '1',
          orderId: '1',
          paymentId: '1',
          signature: '1',
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
        },
      ],
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PrismaModule,
        RazorpayModule.forRoot({
          key_id: 'rzp_test_NWQuG4HubVCcEp',
          key_secret: 'xVEVYZqrMbmyRbslvdK1J956',
        }),
      ],
      controllers: [PaymentController],
      providers: [
        {
          provide: PaymentService,
          useValue: {
            create: jest
              .fn()
              .mockResolvedValue('This action adds a new payment'),
            buyNow: jest
              .fn()
              .mockResolvedValue('This action returns all payment'),
          },
        },
      ],
    }).compile();

    controller = module.get<PaymentController>(PaymentController);
  });

  describe('create', () => {
    it('should return a new payment', async () => {
      jest
        .spyOn(controller, 'create')
        .mockImplementation(async () => returnedData);

      expect(await controller.create(cred, req)).toBe(returnedData);

      expect(controller.create).toHaveBeenCalled();
    });
  });

  describe('buyNow', () => {
    it('should return an array of payment', async () => {
      jest
        .spyOn(controller, 'buyNow')
        .mockImplementation(async () => bynowReturned);

      expect(await controller.buyNow(bynowCred, req)).toBe(bynowReturned);

      expect(controller.buyNow).toHaveBeenCalled();
    });
  });
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
