import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { InjectRazorpay } from 'nestjs-razorpay';
import Razorpay from 'razorpay';
import { PrismaService } from 'src/prisma/prisma.service';
import { BuyNowDto } from './dto/buy-now.dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRazorpay() private readonly razorpay: Razorpay,
    private prisma: PrismaService,
  ) {}

  async buyNow(buyNowDto: BuyNowDto, req: any) {
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
    const adress = await this.prisma.adress.findFirst({
      where: {
        customerId: customer.id,
        isdeleted: false,
      },
    });
    if (!adress) {
      return {
        statusCode: 404,
        message: 'Adress not found',
      };
    }
    const { product_VarientrId, quantity, CashOnDelivery } = buyNowDto;
    const product = await this.prisma.product_variant.findUnique({
      where: {
        id: product_VarientrId,
        isdeleted: false,
      },
    });
    if (!product) {
      return {
        statusCode: 404,
        message: 'Product not found',
      };
    }
    const totalPrice = product.price * quantity;
    const { currency } = buyNowDto;
    if (CashOnDelivery) {
      const payment = await this.prisma.payment.create({
        data: {
          customer: {
            connect: { id: customer.id },
          },
          COD: CashOnDelivery,
        },
      });

      const order = await this.prisma.order.create({
        data: {
          customerId: customer.id,
          paymentId: payment.id,
          paymentStatus: 'Pending',
          paymentMethod: 'CashOnDelivery',
          productIds: [product.id],
          products: [product],
          totalPrice,
          tatalItems: quantity,
        },
      });
      return {
        statusCode: 200,
        message: 'Payment created successfully',
        data: { info: 'CashOnDelivery' },
        order,
      };
    }
    const options = {
      amount: totalPrice * 100,
      currency,
      receipt: customer.email,
    };

    const res = await this.razorpay.orders.create(options);

    const payment = await this.prisma.payment.create({
      data: {
        customer: {
          connect: { id: customer.id },
        },
        COD: CashOnDelivery,
      },
    });
    const order = await this.prisma.order.create({
      data: {
        customerId: customer.id,
        paymentId: payment.id,
        paymentStatus: 'Pending',
        paymentMethod: 'Online',
        productIds: [product.id],
        products: [product],
        totalPrice,
        tatalItems: quantity,
      },
    });
    return {
      statusCode: 200,
      message: 'Payment created successfully',
      data: res,
      order,
    };
  }

  // This function is used to get all payments

  async create(createPaymentDto: CreatePaymentDto, req: any) {
    const { user } = req;
    const customer = await this.prisma.customer.findUnique({
      where: {
        id: user.id,
        isdeleted: false,
      },
    });
    const cart = await this.prisma.cart.findFirst({
      where: {
        customerId: customer.id,
        isdeleted: false,
      },
    });

    if (!cart) {
      return {
        statusCode: 404,
        message: 'Cart not found',
      };
    }
    const adress = await this.prisma.adress.findFirst({
      where: {
        customerId: customer.id,
        isdeleted: false,
      },
    });
    if (!adress) {
      return {
        statusCode: 404,
        message: 'Adress not found',
      };
    }

    console.log(cart.products);
    const products = cart.products;
    const totalPrice = cart.totalPrice;

    const { currency, CashOnDelivery } = createPaymentDto;
    if (CashOnDelivery) {
      const payment = await this.prisma.payment.create({
        data: {
          customer: {
            connect: { id: customer.id },
          },
          COD: CashOnDelivery,
        },
      });

      const order = await this.createOrder(req);
      return {
        statusCode: 200,
        message: 'Payment created successfully',
        data: { info: 'CashOnDelivery' },
        order,
      };
    }
    const options = {
      amount: totalPrice * 100,
      currency,
      receipt: customer.email,
    };
    const res = await this.razorpay.orders.create(options);

    const payment = await this.prisma.payment.create({
      data: {
        customer: {
          connect: { id: customer.id },
        },
        COD: CashOnDelivery,
      },
    });
    const order = await this.createOrder(req);
    return {
      statusCode: 200,
      message: 'Payment created successfully',
      data: res,
      order,
    };
  }

  // This function is used to create order

  async createOrder(req: any) {
    const { user } = req;
    const customer = await this.prisma.customer.findUnique({
      where: {
        id: user.id,
        isdeleted: false,
      },
    });

    const cart = await this.prisma.cart.findFirst({
      where: {
        customerId: customer.id,
        isdeleted: false,
      },
    });
    if (!cart) {
      return {
        statusCode: 404,
        message: 'Cart not found',
      };
    }
    console.log(cart.products);
    const productsfromCart = cart.products;
    let promises = [];
    try {
      promises = await this.getProducts(productsfromCart);
    } catch (err) {
      return {
        statusCode: 404,
        message: 'Product not found',
      };
    }

    const products = await Promise.all(promises);
    console.log(products);
    const productIds = this.getProductIds(products);
    const totalPrice = this.calculateTotalPrice(products);
    const totalItems = products.length;

    const payment = await this.prisma.payment.findFirst({
      where: {
        customerId: customer.id,
        isdeleted: false,
      },
    });

    if (!payment) {
      return {
        statusCode: 404,
        message: 'Payment not found',
      };
    }

    let PaymentStatus = 'Pending';
    let PaymentMethod = 'CashOnDelivery';
    if (payment.COD == false) {
      PaymentMethod = 'Online';
      PaymentStatus = 'Paid';
    }
    const adress = await this.prisma.adress.findFirst({
      where: {
        customerId: customer.id,
        isdeleted: false,
      },
    });
    if (!adress) {
      return {
        statusCode: 404,
        message: 'Adress not found',
      };
    }

    const order = await this.prisma.order.create({
      data: {
        customerId: customer.id,
        paymentId: payment.id,
        paymentStatus: PaymentStatus,
        paymentMethod: PaymentMethod,
        productIds,
        products: products,
        totalPrice,
        tatalItems: totalItems,
      },
    });

    const cartUpdate = await this.prisma.cart.update({
      where: {
        id: cart.id,
      },
      data: {
        isdeleted: true,
      },
    });
    const shippmentstatus = await this.prisma.shipmentStatus.create({
      data: {
        order: {
          connect: {
            id: order.id,
          },
        },
        adress: {
          connect: {
            id: adress.id,
          },
        },
        status: 'Pending',
      },
    });

    return {
      data: order,
      shippmentstatus,
      payment,
    };
  }

  // Some Fuctions used for calculating total price and getting product details

  async getProducts(products: Array<any>) {
    let productDetails = products.map(async (product) => {
      return await this.prisma.product_variant.findUnique({
        where: {
          id: product.id,
          isdeleted: false,
        },
      });
    });
    return productDetails;
    console.log(productDetails);
  }

  getProductIds(products) {
    let productIds = [];
    for (let i = 0; i < products.length; i++) {
      productIds.push(products[i].id);
    }
    return productIds;
  }

  calculateTotalPrice(products) {
    let totalPrice = 0;
    for (let i = 0; i < products.length; i++) {
      totalPrice += products[i].price;
    }
    return totalPrice;
  }
}
