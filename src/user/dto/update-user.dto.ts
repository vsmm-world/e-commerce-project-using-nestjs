import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsNotEmpty, Validate } from 'class-validator';
import { CustomEmailValidator } from '../../validator/custom-validator';


export class UpdateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @Validate(CustomEmailValidator, {
    message: 'Invalid email format (e.g. example@test.com )',
  })
  email: string;
}
