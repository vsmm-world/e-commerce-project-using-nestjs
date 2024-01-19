import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RazorpayModule } from 'nestjs-razorpay';

describe('PaymentService', () => {
  let service: PaymentService;

  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PrismaModule,
        RazorpayModule.forRoot({
          key_id: 'rzp_test_NWQuG4HubVCcEp',
          key_secret: 'xVEVYZqrMbmyRbslvdK1J956',
        }),
      ],
      providers: [PaymentService],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
