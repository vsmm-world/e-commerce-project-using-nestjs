import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { BuyNowDto } from './dto/buy-now.dto';

@ApiTags('Payment')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}


  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto, @Request() req: any) {
    return this.paymentService.create(createPaymentDto, req);
  }

  @Post('buy-now')
  buyNow(@Body() buyNowDto: BuyNowDto, @Request() req: any) {
    return this.paymentService.buyNow(buyNowDto, req);
  }
}
