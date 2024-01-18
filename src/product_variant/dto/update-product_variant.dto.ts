import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateProductVariantDto {
  @ApiProperty()
  size: string;

  @ApiProperty()
  color: string;

  @ApiProperty()
  stock: number;

  @ApiProperty()
  price: number;
}
