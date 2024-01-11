import { Injectable } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async create(createCartDto: CreateCartDto, req: any) {
    const { product_variant_id, quantity } = createCartDto;
    const { user } = req;
    const admin = await this.prisma.admin.findUnique({
      where: {
        id: user.id,
        isdeleted: false,
      },
    });

    if (admin) {
      return {
        statusCode: 400,
        message: 'Admin cannot add to cart, its your own product',
      };
    }
    const product = await this.prisma.product_variant.findUnique({
      where: {
        id: product_variant_id,
        isdeleted: false,
      },
    });

    if (!product) {
      return {
        statusCode: 400,
        message: 'Product not found',
      };
    }
    if (product.stock < quantity) {
      return {
        statusCode: 400,
        message: 'Product out of stock',
      };
    }

    let stock = product.stock;

    const cart = await this.prisma.cart.findFirst({
      where: {
        customerId: user.id,
        isdeleted: false,
      },
    });

    if (cart) {
      let Products = [];
      let ProductIds = [];
      ProductIds = cart.productIds;
      Products.push(cart.products);
      let total_price = cart.totalPrice;
      Products.push(product);
      ProductIds.push(product.id);
      total_price = total_price + product.price * quantity;
      let totalItems = Products.length;

      const newCart = await this.prisma.cart.update({
        where: {
          id: cart.id,
          isdeleted: false,
        },
        data: {
          customerId: user.id,
          productIds: ProductIds,
          products: Products,
          totalItems: totalItems,
          totalPrice: total_price,
        },
      });

      const newProduct = await this.prisma.product_variant.update({
        where: {
          id: product_variant_id,
          isdeleted: false,
        },
        data: {
          stock: stock - quantity,
        },
      });
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

      const newProduct = await this.prisma.product_variant.update({
        where: {
          id: product_variant_id,
          isdeleted: false,
        },
        data: {
          stock: stock - quantity,
        },
      });
    }

    return {
      statusCode: 200,
      message: 'Product added to cart successfully',
    };
  }

  async findAll(req: any) {
    const { user } = req;
    const cart = await this.prisma.cart.findFirst({
      where: {
        customerId: user.id,
        isdeleted: false,
      },
    });
    if (!cart) {
      return {
        statusCode: 400,
        message: 'Cart not found',
      };
    }
    return {
      statusCode: 200,
      message: 'Cart found',
      data: cart,
    };
  }
  async update(id: string, updateCartDto: UpdateCartDto, req: any) {
    const { product_variant_id, quantity } = updateCartDto;
    const { user } = req;

    const cart = await this.prisma.cart.findFirst({
      where: {
        customerId: user.id,
        isdeleted: false,
      },
    });
    if (!cart) {
      return {
        statusCode: 400,
        message: 'Cart not found',
      };
    }
    const product = await this.prisma.product_variant.findUnique({
      where: {
        id: product_variant_id,
        isdeleted: false,
      },
    });
    if (!product) {
      return {
        statusCode: 400,
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
    total_price = total_price + product.price * quantity;
    let totalItems = Products.length;
    const newCart = await this.prisma.cart.update({
      where: {
        id: cart.id,
        isdeleted: false,
      },
      data: {
        customerId: user.id,
        productIds: ProductIds,
        products: Products,
        totalItems: totalItems,
        totalPrice: total_price,
      },
    });

    const newProduct = await this.prisma.product_variant.update({
      where: {
        id: product_variant_id,
        isdeleted: false,
      },
      data: {
        stock: quantity,
      },
    });
  }

  async remove(id: string, req: any) {
    const { user } = req;
    const cart = await this.prisma.cart.findFirst({
      where: {
        customerId: user.id,
        isdeleted: false,
      },
    });
    if (!cart) {
      return {
        statusCode: 400,
        message: 'Cart not found',
      };
    }
    const product = await this.prisma.product_variant.findUnique({
      where: {
        id: id,
        isdeleted: false,
      },
    });

    if (!product) {
      return {
        statusCode: 400,
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
        isdeleted: false,
      },
      data: {
        customerId: user.id,
        productIds: ProductIds,
        products: Products,
        totalItems: totalItems,
        totalPrice: total_price,
      },
    });
    const newProduct = await this.prisma.product_variant.update({
      where: {
        id: id,
        isdeleted: false,
      },
      data: {
        stock: product.stock + 1,
      },
    });

    return {
      statusCode: 200,
      message: 'Product removed from cart successfully',
    };
  }
}
