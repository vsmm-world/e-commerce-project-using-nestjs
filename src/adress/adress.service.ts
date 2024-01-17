import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateAdressDto } from './dto/create-adress.dto';
import { UpdateAdressDto } from './dto/update-adress.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddressKeys } from 'src/shared/keys/address.keys';

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
        isDeleted: false,
      },
    });
    if (!customer) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Customer not found',
      };
    }
    if (isDefault) {
      const defaultaddress = await this.prisma.address.findFirst({
        where: {
          isDeleted: false,
          customer: {
            id: user.id,
          },
          isDefault: true,
        },
      });
      if (defaultaddress) {
        await this.prisma.address.update({
          where: {
            id: defaultaddress.id,
          },
          data: {
            isDefault: false,
          },
        });
      }
    }

    return this.prisma.address.create({
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
    return this.prisma.address.findMany({
      where: {
        isDeleted: false,
        customerId: user.id,
      },
    });
  }

  async findOne(id: string, req) {
    const { user } = req;
    const address = await this.prisma.address.findFirst({
      where: {
        id,
        isDeleted: false,
        customerId: user.id,
      },
    });

    if (!address) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: AddressKeys.NOT_FOUND,
      };
    }

    return {
      statusCode: 201,
      message: AddressKeys.FETCHED,
      data: address,
    };
  }

  //

  async update(id: string, updateaddressDto: UpdateAdressDto, req) {
    const { name, street, city, state, zip, phone, isDefault } =
      updateaddressDto;
    const { user } = req;
    const address = await this.prisma.address.findFirst({
      where: {
        id,
        isDeleted: false,
        customer: {
          id: user.id,
        },
      },
    });

    if (!address) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: AddressKeys.NOT_FOUND,
      };
    }

    if (isDefault) {
      const defaultaddress = await this.prisma.address.findFirst({
        where: {
          isDeleted: false,
          customer: {
            id: user.id,
          },
          isDefault: true,
        },
      });
      if (defaultaddress) {
        await this.prisma.address.update({
          where: {
            isDeleted: false,
            id: defaultaddress.id,
          },
          data: {
            isDefault: false,
          },
        });
      }
    }

    const updatedAddress = await this.prisma.address.update({
      where: {
        id,
        isDeleted: false,
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
      message: AddressKeys.UPDATED,
      data: updatedAddress,
    };
  }

  //

  async remove(id: string, req) {
    const { user } = req;
    const address = await this.prisma.address.findFirst({
      where: {
        id,
        isDeleted: false,
        customer: {
          id: user.id,
        },
      },
    });

    if (!address) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: AddressKeys.NOT_FOUND,
      };
    }

    const deletedAddress = await this.prisma.address.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
      },
    });

    return {
      statusCode: 201,
      message: AddressKeys.DELETED,
      data: deletedAddress,
    };
  }
}
