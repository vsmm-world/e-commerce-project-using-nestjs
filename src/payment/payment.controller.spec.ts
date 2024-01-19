import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RazorpayModule } from 'nestjs-razorpay';

describe('PaymentController', () => {
  let controller: PaymentController;

  
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
      providers: [PaymentService],
    }).compile();

    controller = module.get<PaymentController>(PaymentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
