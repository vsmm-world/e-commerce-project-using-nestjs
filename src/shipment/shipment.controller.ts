import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ShipmentService } from './shipment.service';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('shipment')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@Controller('shipment')
export class ShipmentController {
  constructor(private readonly shipmentService: ShipmentService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.shipmentService.findAll(req);
  }

  @Get(':shepmentId')
  findOne(@Param('shepmentId') shepmentId: string) {
    return this.shipmentService.findOne(shepmentId);
  }

  @Patch(':shepmentId')
  update(
    @Param('shepmentId') shepmentId: string,
    @Body() updateShipmentDto: UpdateShipmentDto,
    @Request() req: any,
  ) {
    return this.shipmentService.update(shepmentId, updateShipmentDto, req);
  }

  @Delete(':shepmentId')
  remove(@Param('shepmentId') shepmentId: string, @Request() req: any) {
    return this.shipmentService.remove(shepmentId, req);
  }
}
