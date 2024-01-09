import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InjectRazorpay } from 'nestjs-razorpay';
import Razorpay from 'razorpay';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRazorpay() private readonly razorpay: Razorpay,
    private prisma: PrismaService,
  ) {}

  async create(createPaymentDto: CreatePaymentDto) {
    const { amount, currency, receipt } = createPaymentDto;
    const options = {
      amount: amount * 100,
      currency,
      receipt,
    };
    const res = await this.razorpay.orders.create(options);
    return {
      statusCode: 200,
      message: 'Payment created successfully',
      data: res,
    };
  }

  async findAll() {
    return `This action returns all payment`;
  }

  async findOne(id: number) {
    return `This action returns a #${id} payment`;
  }

  async update(id: number, updatePaymentDto: UpdatePaymentDto) {
    return `This action updates a #${id} payment`;
  }

  async remove(id: number) {
    return `This action removes a #${id} payment`;
  }
}
