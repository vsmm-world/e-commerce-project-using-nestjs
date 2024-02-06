import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RazorpayModule } from 'nestjs-razorpay';
@Module({
  imports: [
    PrismaModule,
    RazorpayModule.forRoot({
      key_id: 'rzp_test_NWQuG4HubVCcEp',
      key_secret: 'xVEVYZqrMbmyRbslvdK1J956',
    }),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
