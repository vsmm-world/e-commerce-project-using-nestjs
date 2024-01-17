import { HttpStatus, Injectable } from '@nestjs/common';
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
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Admin not found',
      };
    }
    const shipments = this.prisma.shipmentStatus.findMany({
      where: {
        isDeleted: false,
      },
    });

    if (shipments[0] == null) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Shipments not found',
      };
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'Shipments found successfully',
      shipments: shipments,
    };
  }

  async findOne(id: string) {
    const shipment = await this.prisma.shipmentStatus.findFirst({
      where: {
        id: id,
        isDeleted: false,
      },
    });

    if (!shipment) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Shipment not found',
      };
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'Shipment found successfully',
      shipment: shipment,
    };
  }

  async update(id: string, updateShipmentDto: UpdateShipmentDto, req: any) {
    const { user } = req;
    const isAdmin = await this.isAdmin(user);
    if (!isAdmin) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Admin not found',
      };
    }
    const shiopmentCheck = await this.prisma.shipmentStatus.findFirst({
      where: {
        id: id,
        isDeleted: false,
      },
    });
    if (!shiopmentCheck) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
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

      const orderHistory = await this.prisma.orderHistory.create({
        data: {
          order: {
            connect: {
              id: order.id,
            },
          },
          products: order.products,
          productsIds: order.productIds,
          customer: {
            connect: {
              id: customer.id,
            },
          },
          status: 'Delivered',
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
          isDeleted: true,
        },
      });
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'Shipment updated successfully',
      shipment: shipment,
    };
  }

  async remove(id: string, req: any) {
    const { user } = req;
    const isAdmin = await this.isAdmin(user);
    if (!isAdmin) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Admin not found',
      };
    }
    const shiopmentCheck = await this.prisma.shipmentStatus.findFirst({
      where: {
        id: id,
        isDeleted: false,
      },
    });
    if (!shiopmentCheck) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Shipment not found',
      };
    }
    const shipment = await this.prisma.shipmentStatus.update({
      where: {
        id: id,
      },
      data: {
        isDeleted: true,
      },
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Shipment deleted successfully',
    };
  }

  // fucntion for detecting admin
  async isAdmin(user: any) {
    const admin = await this.prisma.admin.findUnique({
      where: {
        id: user.id,
        isDeleted: false,
      },
    });
    if (admin) {
      return true;
    }
    return false;
  }
}
