import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateCartDto {
  @ApiProperty()
  @IsNotEmpty()
  product_variant_id: string;

  @ApiProperty()
  @IsNotEmpty()
  quantity: number;

}
