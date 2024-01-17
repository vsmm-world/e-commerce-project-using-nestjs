import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async create(createCartDto: CreateCartDto, req: any) {
    const { productVariantId, quantity } = createCartDto;
    const { user } = req;
    const admin = await this.prisma.admin.findUnique({
      where: {
        id: user.id,
        isDeleted: false,
      },
    });

    if (admin) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Admin cannot add to cart, its your own product',
      };
    }
    const product = await this.prisma.productVariant.findUnique({
      where: {
        id: productVariantId,
        isDeleted: false,
      },
    });

    if (!product) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Product not found',
      };
    }
    if (product.stock < quantity) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Product out of stock',
      };
    }

    let stock = product.stock;

    const cart = await this.prisma.cart.findFirst({
      where: {
        customerId: user.id,
        isDeleted: false,
      },
    });

    if (cart) {
      let Products = [];
      let ProductIds = [];
      ProductIds = cart.productIds;
      Products = cart.products;
      let total_price = cart.totalPrice;
      Products.push(product);
      ProductIds.push(product.id);
      total_price = total_price + product.price * quantity;
      let totalItems = Products.length;

      const newCart = await this.prisma.cart.update({
        where: {
          id: cart.id,
          isDeleted: false,
        },
        data: {
          customerId: user.id,
          productIds: ProductIds,
          products: Products,
          totalItems: totalItems,
          totalPrice: total_price,
        },
      });

      const newProduct = await this.prisma.productVariant.update({
        where: {
          id: productVariantId,
          isDeleted: false,
        },
        data: {
          stock: stock - quantity,
        },
      });
      return {
        statusCode: HttpStatus.OK,
        message: 'Product added to cart successfully',
        Products,
      };
    }

    if (!cart) {
      let Products = [];
      let ProductIds = [];
      Products.push(product);
      ProductIds.push(product.id);
      const totalItems = Products.length;
      const newCart = await this.prisma.cart.create({
        data: {
          customer: {
            connect: {
              id: user.id,
            },
          },
          productIds: ProductIds,
          products: Products,
          totalItems: totalItems,
          totalPrice: product.price,
        },
      });

      const newProduct = await this.prisma.productVariant.update({
        where: {
          id: productVariantId,
          isDeleted: false,
        },
        data: {
          stock: stock - quantity,
        },
      });
      return {
        statusCode: HttpStatus.OK,
        message: 'Product added to cart successfully',
        Products,
      };
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'Product added to cart successfully',
    };
  }

  async findAll(req: any) {
    const { user } = req;
    const cart = await this.prisma.cart.findFirst({
      where: {
        customerId: user.id,
        isDeleted: false,
      },
    });
    if (!cart) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Cart not found',
      };
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'Cart found',
      data: cart,
    };
  }
  async update(id: string, updateCartDto: UpdateCartDto, req: any) {
    // const { productVariant_id, quantity } = updateCartDto;
    const { user } = req;

    const cart = await this.prisma.cart.findFirst({
      where: {
        customerId: user.id,
        isDeleted: false,
      },
    });
    if (!cart) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Cart not found',
      };
    }
    const product = await this.prisma.productVariant.findUnique({
      where: {
        id: updateCartDto.productVariantId,
        isDeleted: false,
      },
    });
    if (!product) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Product not found',
      };
    }
    let Products = [];
    let ProductIds = [];
    ProductIds = cart.productIds;
    Products.push(cart.products);
    let total_price = cart.totalPrice;
    Products.push(product);
    ProductIds.push(product.id);
    total_price = total_price + product.price * updateCartDto.quantity;
    let totalItems = Products.length;
    const newCart = await this.prisma.cart.update({
      where: {
        id: cart.id,
        isDeleted: false,
      },
      data: {
        customerId: user.id,
        productIds: ProductIds,
        products: Products,
        totalItems: totalItems,
        totalPrice: total_price,
      },
    });

    const newProduct = await this.prisma.productVariant.update({
      where: {
        id: updateCartDto.productVariantId,
        isDeleted: false,
      },
      data: {
        stock: updateCartDto.quantity,
      },
    });
  }

  async remove(id: string, req: any) {
    const { user } = req;
    const cart = await this.prisma.cart.findFirst({
      where: {
        customerId: user.id,
        isDeleted: false,
      },
    });
    if (!cart) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Cart not found',
      };
    }
    const product = await this.prisma.productVariant.findUnique({
      where: {
        id: id,
        isDeleted: false,
      },
    });

    if (!product) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Product not found',
      };
    }

    let Products = [];
    let ProductIds = [];
    ProductIds = cart.productIds;
    Products.push(cart.products);
    let total_price = cart.totalPrice;
    let totalItems = Products.length;
    const index = ProductIds.indexOf(id);
    if (index > -1) {
      ProductIds.splice(index, 1);
    }
    if (index > -1) {
      Products.splice(index, 1);
    }
    total_price = total_price - product.price;
    totalItems = totalItems - 1;
    const newCart = await this.prisma.cart.update({
      where: {
        id: cart.id,
        isDeleted: false,
      },
      data: {
        customerId: user.id,
        productIds: ProductIds,
        products: Products,
        totalItems: totalItems,
        totalPrice: total_price,
      },
    });
    const newProduct = await this.prisma.productVariant.update({
      where: {
        id: id,
        isDeleted: false,
      },
      data: {
        stock: product.stock + 1,
      },
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Product removed from cart successfully',
      Products,
    };
  }
}
