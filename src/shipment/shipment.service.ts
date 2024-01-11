import { Injectable } from '@nestjs/common';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ShipmentService {
  constructor(private prisma: PrismaService) {}

  async findAll(req: any) {
    const { user } = req;
    const isAdmin = await this.isAdmin(user);
    if (!isAdmin) {
      return {
        statusCode: 400,
        message: 'Admin not found',
      };
    }
    const shipments = this.prisma.shipmentStatus.findMany({
      where: {
        isdeleted: false,
      },
    });

    if (shipments[0] == null) {
      return {
        statusCode: 400,
        message: 'Shipments not found',
      };
    }

    return {
      statusCode: 200,
      message: 'Shipments found successfully',
      shipments: shipments,
    };
  }

  async findOne(id: string) {
    const shipment = await this.prisma.shipmentStatus.findFirst({
      where: {
        id: id,
        isdeleted: false,
      },
    });

    if (!shipment) {
      return {
        statusCode: 400,
        message: 'Shipment not found',
      };
    }

    return {
      statusCode: 200,
      message: 'Shipment found successfully',
      shipment: shipment,
    };
  }

  async update(id: string, updateShipmentDto: UpdateShipmentDto, req: any) {
    const { user } = req;
    const isAdmin = await this.isAdmin(user);
    if (!isAdmin) {
      return {
        statusCode: 400,
        message: 'Admin not found',
      };
    }
    const shiopmentCheck = await this.prisma.shipmentStatus.findFirst({
      where: {
        id: id,
        isdeleted: false,
      },
    });
    if (!shiopmentCheck) {
      return {
        statusCode: 400,
        message: 'Shipment not found',
      };
    }
    const shipment = await this.prisma.shipmentStatus.update({
      where: {
        id: id,
      },
      data: {
        ...updateShipmentDto,
      },
    });

    if (shipment.status == 'Delivered') {
      const order = await this.prisma.order.findUnique({
        where: {
          id: shipment.orderId,
        },
      });
      const customer = await this.prisma.customer.findUnique({
        where: {
          id: order.customerId,
        },
      });
      let history = customer.orderHistory;
      history.push(order.id);
      await this.prisma.customer.update({
        where: {
          id: order.customerId,
        },
        data: {
          orderHistory: history,
        },
      });
      const payment = await this.prisma.payment.findUnique({
        where: {
          id: order.paymentId,
        },
      });

      await this.prisma.order.update({
        where: {
          id: shipment.orderId,
        },
        data: {
          isdeleted: true,
        },
      });
    }
    return {
      statusCode: 200,
      message: 'Shipment updated successfully',
      shipment: shipment,
    };
  }

  async remove(id: string, req: any) {
    const { user } = req;
    const isAdmin = await this.isAdmin(user);
    if (!isAdmin) {
      return {
        statusCode: 400,
        message: 'Admin not found',
      };
    }
    const shiopmentCheck = await this.prisma.shipmentStatus.findFirst({
      where: {
        id: id,
        isdeleted: false,
      },
    });
    if (!shiopmentCheck) {
      return {
        statusCode: 400,
        message: 'Shipment not found',
      };
    }
    const shipment = await this.prisma.shipmentStatus.update({
      where: {
        id: id,
      },
      data: {
        isdeleted: true,
      },
    });

    return {
      statusCode: 200,
      message: 'Shipment deleted successfully',
    };
  }

  // fucntion for detecting admin
  async isAdmin(user: any) {
    const admin = await this.prisma.admin.findUnique({
      where: {
        id: user.id,
        isdeleted: false,
      },
    });
    if (admin) {
      return true;
    }
    return false;
  }
}
