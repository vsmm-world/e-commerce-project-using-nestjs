import { ApiProperty } from '@nestjs/swagger';

export class UpdateAdressDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  street: string;

  @ApiProperty()
  city: string;

  @ApiProperty()
  state: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  pincode: string;

  @ApiProperty()
  isDefault: boolean;
}
