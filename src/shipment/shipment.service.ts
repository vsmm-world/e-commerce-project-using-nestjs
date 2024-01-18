import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ShipmentKeys } from 'src/shared/keys/shipment.keys';

@Injectable()
export class ShipmentService {
  constructor(private prisma: PrismaService) {}

  async findAll(req: any) {
    const { user } = req;
    const isAdmin = await this.isAdmin(user);
    if (!isAdmin) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: ShipmentKeys.ADMIN_NOT_FOUND,
      };
    }
    return this.prisma.shipmentStatus.findMany({
      where: {
        isDeleted: false,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.shipmentStatus.findFirst({
      where: {
        id: id,
        isDeleted: false,
      },
    });
  }

  async update(id: string, updateShipmentDto: UpdateShipmentDto, req: any) {
    const { user } = req;
    const isAdmin = await this.isAdmin(user);
    if (!isAdmin) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: ShipmentKeys.ADMIN_NOT_FOUND,
      };
    }
    const shipmentCheck = await this.prisma.shipmentStatus.findFirst({
      where: {
        id: id,
        isDeleted: false,
      },
    });
    if (!shipmentCheck) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: ShipmentKeys.SHIPMENT_NOT_FOUND,
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
          orderId: order.id,
          products: order.products,
          productsIds: order.productIds,
          customerId: customer.id,
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
      message: ShipmentKeys.SHIPMENT_UPDATED_SUCCESSFULLY,
      shipment: shipment,
    };
  }

  async remove(id: string, req: any) {
    const { user } = req;
    const isAdmin = await this.isAdmin(user);
    if (!isAdmin) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: ShipmentKeys.ADMIN_NOT_FOUND,
      };
    }
    const shipmentCheck = await this.prisma.shipmentStatus.findFirst({
      where: {
        id: id,
        isDeleted: false,
      },
    });
    if (!shipmentCheck) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: ShipmentKeys.SHIPMENT_NOT_FOUND,
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
      message: ShipmentKeys.SHIPMENT_DELETED_SUCCESSFULLY,
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
