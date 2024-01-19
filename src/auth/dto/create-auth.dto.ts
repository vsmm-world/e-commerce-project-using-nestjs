import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Validate } from 'class-validator';
import {
  CustomEmailValidator,
  PasswordValidator,
} from '../../validator/custom-validator';

export class CreateAuthDto {
  @ApiProperty()
  @IsNotEmpty()
  @Validate(CustomEmailValidator, {
    message: 'Email is not valid',
  })
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @Validate(PasswordValidator, {
    message: 'Password is not valid',
  })
  password: string;
}

export class verifyOTPDto {
  @ApiProperty()
  @IsNotEmpty()
  otp: string;

  @ApiProperty()
  @IsNotEmpty()
  otpRef: string;
}
