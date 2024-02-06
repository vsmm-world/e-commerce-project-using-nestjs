import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Validate } from 'class-validator';
import { PasswordValidator } from '../../validator/custom-validator';

export class ResetPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  token: string;

  @ApiProperty()
  @IsNotEmpty()
  @Validate(PasswordValidator, {
    message: 'Password is not strong enough',
  })
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @Validate(PasswordValidator, {
    message: 'Password is not strong enough',
  })
  confirPassword: string;
}
