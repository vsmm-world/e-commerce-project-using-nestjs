import { Injectable } from '@nestjs/common';
import { CreateAdressDto } from './dto/create-adress.dto';
import { UpdateAdressDto } from './dto/update-adress.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AdressService {
  constructor(private prisma: PrismaService) {}

  //

  async create(createAdressDto: CreateAdressDto, req) {
    const { name, street, city, state, zip, phone, isDefault } =
      createAdressDto;
    const { user } = req;
    const customer = await this.prisma.customer.findUnique({
      where: {
        id: user.id,
        isdeleted: false,
      },
    });
    if (!customer) {
      return {
        statusCode: 404,
        message: 'Customer not found',
      };
    }
    if (isDefault) {
      const defaultAdress = await this.prisma.adress.findFirst({
        where: {
          isdeleted: false,
          customer: {
            id: user.id,
          },
          isDefault: true,
        },
      });
      if (defaultAdress) {
        await this.prisma.adress.update({
          where: {
            id: defaultAdress.id,
          },
          data: {
            isDefault: false,
          },
        });
      }
    }

    return this.prisma.adress.create({
      data: {
        customerId: user.id,
        name,
        street,
        city,
        state,
        pincode: zip,
        phone,
        isDefault,
      },
    });
  }

  async findAll(req) {
    const { user } = req;
    return this.prisma.adress.findMany({
      where: {
        isdeleted: false,
        customerId: user.id,
      },
    });
  }

  async findOne(id: string, req) {
    const { user } = req;
    const address = await this.prisma.adress.findFirst({
      where: {
        id,
        isdeleted: false,
        customerId: user.id,
      },
    });

    if (!address) {
      return {
        statusCode: 400,
        message: 'No address found',
      };
    }

    return {
      statusCode: 201,
      message: 'Address fetched successfully',
      data: address,
    };
  }

  //

  async update(id: string, updateAdressDto: UpdateAdressDto, req) {
    const { name, street, city, state, zip, phone, isDefault } =
      updateAdressDto;
    const { user } = req;
    const address = await this.prisma.adress.findFirst({
      where: {
        id,
        isdeleted: false,
        customer: {
          id: user.id,
        },
      },
    });

    if (!address) {
      return {
        statusCode: 400,
        message: 'No address found',
      };
    }

    if (isDefault) {
      const defaultAdress = await this.prisma.adress.findFirst({
        where: {
          isdeleted: false,
          customer: {
            id: user.id,
          },
          isDefault: true,
        },
      });
      if (defaultAdress) {
        await this.prisma.adress.update({
          where: {
            isdeleted: false,
            id: defaultAdress.id,
          },
          data: {
            isDefault: false,
          },
        });
      }
    }

    const updatedAddress = await this.prisma.adress.update({
      where: {
        id,
        isdeleted: false,
      },
      data: {
        name,
        street,
        city,
        state,
        pincode: zip,
        phone,
        isDefault,
      },
    });

    return {
      statusCode: 201,
      message: 'Address updated successfully',
      data: updatedAddress,
    };
  }

  //

  async remove(id: string, req) {
    const { user } = req;
    const address = await this.prisma.adress.findFirst({
      where: {
        id,
        isdeleted: false,
        customer: {
          id: user.id,
        },
      },
    });

    if (!address) {
      return {
        statusCode: 400,
        message: 'No address found',
      };
    }

    const deletedAddress = await this.prisma.adress.update({
      where: {
        id,
      },
      data: {
        isdeleted: true,
      },
    });

    return {
      statusCode: 201,
      message: 'Address deleted successfully',
      data: deletedAddress,
    };
  }
}
