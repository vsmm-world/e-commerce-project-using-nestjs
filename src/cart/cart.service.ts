import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CartKeys } from 'src/shared/keys/cart.keys';

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
        message: CartKeys.ADMIN_ERR,
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
        message: CartKeys.PRODUCT_NOT_FOUND,
      };
    }
    if (product.stock < quantity) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: CartKeys.OUT_OF_STOCK,
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
        message: CartKeys.PRODUCT_ADDED,
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
        message: CartKeys.PRODUCT_ADDED,
        Products,
      };
    }

    return {
      statusCode: HttpStatus.OK,
      message: CartKeys.PRODUCT_ADDED,
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
        message: CartKeys.CART_NOT_FOUND,
      };
    }
    return {
      statusCode: HttpStatus.OK,
      message: CartKeys.CART_NOT_FOUND,
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
        message: CartKeys.CART_NOT_FOUND,
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
        message: CartKeys.PRODUCT_NOT_FOUND,
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
        message: CartKeys.CART_NOT_FOUND,
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
      message: CartKeys.PRODUCT_REMOVED,
      Products,
    };
  }
}
