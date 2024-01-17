import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateCartDto {
  @ApiProperty()
  @IsNotEmpty()
  productVariantId: string;

  @ApiProperty()
  @IsNotEmpty()
  quantity: number;

}
