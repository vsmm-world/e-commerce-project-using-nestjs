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

@ApiTags('adress')
@Controller('adress')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class AdressController {
  constructor(private readonly adressService: AdressService) {}

  @Post()
  create(@Body() createAdressDto: CreateAdressDto, @Request() req: any) {
    return this.adressService.create(createAdressDto, req);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.adressService.findAll(req);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.adressService.findOne(id, req);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAdressDto: UpdateAdressDto,
    @Request() req: any,
  ) {
    return this.adressService.update(id, updateAdressDto, req);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.adressService.remove(id, req);
  }
}
