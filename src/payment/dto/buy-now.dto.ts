import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class BuyNowDto {
  @ApiProperty()
  @IsNotEmpty()
  ProductVariantId: string;

  @ApiProperty()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty()
  @IsNotEmpty()
  CashOnDelivery: boolean;

  @ApiProperty()
  currency: string;
}
