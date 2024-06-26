import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AdressService } from './adress.service';
import { CreateAdressDto } from './dto/create-adress.dto';
import { UpdateAdressDto } from './dto/update-adress.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('address')
@Controller('address')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class AdressController {
  constructor(private readonly addressService: AdressService) {}

  @Post()
  create(@Body() createAdressDto: CreateAdressDto, @Request() req: any) {
    return this.addressService.create(createAdressDto, req);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.addressService.findAll(req);
  }

  @Get(':addressId')
  findOne(@Param('addressaddressId') addressId: string, @Request() req: any) {
    return this.addressService.findOne(addressId, req);
  }

  @Patch(':addressId')
  update(
    @Param('addressId') addressId: string,
    @Body() updateaddressDto: UpdateAdressDto,
    @Request() req: any,
  ) {
    return this.addressService.update(addressId, updateaddressDto, req);
  }

  @Delete(':addressId')
  remove(@Param('addressId') addressId: string, @Request() req: any) {
    return this.addressService.remove(addressId, req);
  }
}
