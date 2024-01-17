import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get()
  findAll(@Request() req: any) {
    return this.userService.findAll(req);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get(':userId')
  findOne(@Param('userId') userId: string, @Request() req: any) {
    return this.userService.findOne(userId, req);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Patch(':userId')
  update(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: any,
  ) {
    return this.userService.update(userId, updateUserDto, req);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Delete(':userId')
  remove(@Param('userId') userId: string, @Request() req: any) {
    return this.userService.remove(userId, req);
  }
}
