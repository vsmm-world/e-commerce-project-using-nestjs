import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateShipmentDto {
  @ApiProperty()
  @IsNotEmpty()
  status: string;
}
