import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Validate } from 'class-validator';
import { CustomEmailValidator } from '../../validator/custom-validator';

export class ForgetPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @Validate(CustomEmailValidator, {
    message: 'Email is not valid',
  })
  email: string;
}
