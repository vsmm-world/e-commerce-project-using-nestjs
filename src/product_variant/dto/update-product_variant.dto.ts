import { ApiProperty } from '@nestjs/swagger';

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
