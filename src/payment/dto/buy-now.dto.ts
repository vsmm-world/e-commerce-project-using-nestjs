import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class BuyNowDto {
  @ApiProperty()
  @IsNotEmpty()
  product_VarientrId: string;

  @ApiProperty()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty()
  @IsNotEmpty()
  CashOnDelivery: boolean;

  @ApiProperty()
  currency: string;
}
