import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateAdressDto } from './dto/create-adress.dto';
import { UpdateAdressDto } from './dto/update-adress.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AddressKeys } from '../shared/keys/address.keys';

@Injectable()
export class AdressService {
  constructor(private prisma: PrismaService) {}

  //

  async create(createAdressDto: CreateAdressDto, req) {
    const { isDefault } = createAdressDto;
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
        ...createAdressDto,
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
    return this.prisma.address.findFirst({
      where: {
        id,
        isDeleted: false,
        customerId: user.id,
      },
    });
  }

  //

  async update(id: string, updateaddressDto: UpdateAdressDto, req) {
    const { isDefault } = updateaddressDto;
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

    return this.prisma.address.update({
      where: {
        id,
        isDeleted: false,
      },
      data: {
        ...updateaddressDto,
      },
    });
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
      statusCode: HttpStatus.OK,
      message: AddressKeys.DELETED,
    };
  }
}
