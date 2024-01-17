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
import { ShipmentService } from './shipment.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('shipment')
@Controller('shipment')
export class ShipmentController {
  constructor(private readonly shipmentService: ShipmentService) {}

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get()
  findAll(@Request() req: any) {
    return this.shipmentService.findAll(req);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get(':shepmentId')
  findOne(@Param('shepmentId') shepmentId: string) {
    return this.shipmentService.findOne(shepmentId);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Patch(':shepmentId')
  update(
    @Param('shepmentId') shepmentId: string,
    @Body() updateShipmentDto: UpdateShipmentDto,
    @Request() req: any,
  ) {
    return this.shipmentService.update(shepmentId, updateShipmentDto, req);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Delete(':shepmentId')
  remove(@Param('shepmentId') shepmentId: string, @Request() req: any) {
    return this.shipmentService.remove(shepmentId, req);
  }
}
