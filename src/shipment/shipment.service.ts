import { Injectable } from '@nestjs/common';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ShipmentService {
  constructor(private prisma: PrismaService) {}

  async findAll(req: any) {
    const { user } = req;
    const admin = await this.prisma.admin
      .findUnique({
        where: {
          id: user.id,
          isdeleted: false,
        },
      })
      .catch((err) => {
        throw new Error(' Admin not found');
      });

    if (!admin) {
      throw new Error(' Admin not found');
    }

    const shipments = this.prisma.shipmentStatus
      .findMany({
        where: {
          isdeleted: false,
        },
      })
      .catch((err) => {
        throw new Error(' Shipments not found');
      });

    if (!shipments) {
      throw new Error(' Shipments not found');
    }

    return {
      statusCode: 200,
      message: 'Shipments found successfully',
      shipments: shipments,
    };
  }

  async findOne(id: string) {
    const shipment = await this.prisma.shipmentStatus
      .findFirst({
        where: {
          id: id,
          isdeleted: false,
        },
      })
      .catch((err) => {
        throw new Error(' Shipment not found');
      });

    if (!shipment) {
      throw new Error(' Shipment not found');
    }

    return {
      statusCode: 200,
      message: 'Shipment found successfully',
      shipment: shipment,
    };
  }

  async update(id: string, updateShipmentDto: UpdateShipmentDto, req: any) {
    const { user } = req;
    const admin = await this.prisma.admin
      .findUnique({
        where: {
          id: user.id,
          isdeleted: false,
        },
      })
      .catch((err) => {
        throw new Error(' Admin not found');
      });

    if (!admin) {
      throw new Error(' Admin not found');
    }

    const shipment = await this.prisma.shipmentStatus
      .update({
        where: {
          id: id,
        },
        data: {
          ...updateShipmentDto,
        },
      })
      .catch((err) => {
        throw new Error(' Shipment not found');
      });

    if (!shipment) {
      throw new Error(' Shipment not found');
    }

    return {
      statusCode: 200,
      message: 'Shipment updated successfully',
      shipment: shipment,
    };
  }

  async remove(id: string, req: any) {
    const { user } = req;
    const admin = await this.prisma.admin
      .findUnique({
        where: {
          id: user.id,
          isdeleted: false,
        },
      })
      .catch((err) => {
        throw new Error(' Admin not found');
      });

    if (!admin) {
      throw new Error(' Admin not found');
    }

    const shipment = await this.prisma.shipmentStatus
      .update({
        where: {
          id: id,
        },
        data: {
          isdeleted: true,
        },
      })
      .catch((err) => {
        throw new Error(' Shipment not found');
      });

    if (!shipment) {
      throw new Error(' Shipment not found');
    }

    return {
      statusCode: 200,
      message: 'Shipment deleted successfully',
      shipment: shipment,
    };
  }
}
