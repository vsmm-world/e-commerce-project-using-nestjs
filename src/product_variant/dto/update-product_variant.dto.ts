import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateProductVariantDto {
  @ApiProperty()
  @IsNotEmpty()
  size: string;

  @ApiProperty()
  @IsNotEmpty()
  color: string;

  @ApiProperty()
  @IsNotEmpty()
  stock: number;

  @ApiProperty()
  @IsNotEmpty()
  price: number;
}
