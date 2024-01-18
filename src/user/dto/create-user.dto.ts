import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Validate } from 'class-validator';
import {
  CustomEmailValidator,
  PasswordValidator,
} from 'src/validator/custom-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @Validate(CustomEmailValidator, {
    message: 'Invalid email format (e.g. example@test.com )',
  })
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @Validate(PasswordValidator, {
    message: 'Password is not strong enough',
  })
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  role: string;
  deafult: 'customer';
}
