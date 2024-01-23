import { HttpStatus, Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { InjectRazorpay } from 'nestjs-razorpay';
import Razorpay from 'razorpay';
import { PrismaService } from '../prisma/prisma.service';
import { BuyNowDto } from './dto/buy-now.dto';
import { PaymentKeys } from '../shared/keys/payment.keys';
import { env } from 'process';
import Stripe from 'stripe';

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
        isDeleted: false,
      },
    });
    if (!customer) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: PaymentKeys.CUSTOMER_NOT_FOUND,
      };
    }
    const address = await this.prisma.address.findFirst({
      where: {
        customerId: customer.id,
        isDeleted: false,
      },
    });
    if (!address) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: PaymentKeys.ADDRESS_NOT_FOUND,
      };
    }
    const { ProductVariantId, quantity, CashOnDelivery } = buyNowDto;
    const productVariant = await this.prisma.productVariant.findUnique({
      where: {
        id: ProductVariantId,
        isDeleted: false,
      },
    });
    if (!productVariant) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: PaymentKeys.PRODUCT_NOT_FOUND,
      };
    }
    const product = await this.prisma.product.findUnique({
      where: {
        id: productVariant.productId,
        isDeleted: false,
      },
    });
    if (!product) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: PaymentKeys.PRODUCT_NOT_FOUND,
      };
    }
    const totalPrice = productVariant.price * quantity;
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
          productIds: [productVariant.id],
          products: [productVariant],
          totalPrice,
          tatalItems: quantity,
        },
      });
      return {
        statusCode: HttpStatus.OK,
        message: PaymentKeys.PAYMENT_CREATED,
        data: { info: 'CashOnDelivery' },
        order,
      };
    }
    const options = {
      amount: totalPrice * 100,
      currency,
      receipt: customer.email,
    };

    if (env.PAYMENT_MODE == '1') {
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
          productIds: [productVariant.id],
          products: [productVariant],
          totalPrice,
          tatalItems: quantity,
        },
      });

      return {
        statusCode: HttpStatus.OK,
        message: PaymentKeys.PAYMENT_CREATED + 'razorpay',
        data: res,
        order,
      };
    }
    const stripe = new Stripe(env.STRIPE_KEY);
    const res = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: product.name,
            },
            unit_amount: totalPrice * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
    });
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
        productIds: [productVariant.id],
        products: [productVariant],
        totalPrice,
        tatalItems: quantity,
      },
    });
    return {
      statusCode: HttpStatus.OK,
      message: PaymentKeys.PAYMENT_CREATED + 'stripe',
      data: payment,
      order,
    };
  }

  // This function is used to get all payments

  async create(createPaymentDto: CreatePaymentDto, req: any) {
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
        message: PaymentKeys.CUSTOMER_NOT_FOUND,
      };
    }
    const cart = await this.prisma.cart.findFirst({
      where: {
        customerId: customer.id,
        isDeleted: false,
      },
    });

    if (!cart) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: PaymentKeys.CART_NOT_FOUND,
      };
    }
    const address = await this.prisma.address.findFirst({
      where: {
        customerId: customer.id,
        isDeleted: false,
      },
    });
    if (!address) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: PaymentKeys.ADDRESS_NOT_FOUND,
      };
    }

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
        statusCode: HttpStatus.OK,
        message: PaymentKeys.PAYMENT_CREATED + 'razorpay',
        data: { info: 'CashOnDelivery' },
        order,
      };
    }
    const options = {
      amount: totalPrice * 100,
      currency,
      receipt: customer.email,
    };
    if (env.PAYMENT_MODE == '1') {
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
        statusCode: HttpStatus.OK,
        message: PaymentKeys.PAYMENT_CREATED,
        data: res,
        order,
      };
    }

    const stripe = new Stripe(env.STRIPE_KEY);
    const res = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            unit_amount: totalPrice * 100,
            product_data: {
              name: 'Order',
            },
          },

          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel',
    });

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
      statusCode: HttpStatus.OK,
      message: PaymentKeys.PAYMENT_CREATED + 'stripe',
      data: payment,
      order,
    };
  }

  // This function is used to create order

  async createOrder(req: any) {
    const { user } = req;
    const customer = await this.prisma.customer.findUnique({
      where: {
        id: user.id,
        isDeleted: false,
      },
    });

    const cart = await this.prisma.cart.findFirst({
      where: {
        customerId: customer.id,
        isDeleted: false,
      },
    });
    if (!cart) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: PaymentKeys.CART_NOT_FOUND,
      };
    }
    const productsfromCart = cart.products;
    let promises = [];
    try {
      promises = await this.getProducts(productsfromCart);
    } catch (err) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: PaymentKeys.PRODUCT_NOT_FOUND,
      };
    }

    const products = await Promise.all(promises);
    const productIds = this.getProductIds(products);
    const totalPrice = this.calculateTotalPrice(products);
    const totalItems = products.length;

    const payment = await this.prisma.payment.findFirst({
      where: {
        customerId: customer.id,
        isDeleted: false,
      },
    });

    if (!payment) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: PaymentKeys.PAYMENT_NOT_FOUND,
      };
    }

    let PaymentStatus = 'Pending';
    let PaymentMethod = 'CashOnDelivery';
    if (payment.COD == false) {
      PaymentMethod = 'Online';
      PaymentStatus = 'Paid';
    }
    const address = await this.prisma.address.findFirst({
      where: {
        customerId: customer.id,
        isDeleted: false,
      },
    });
    if (!address) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: PaymentKeys.ADDRESS_NOT_FOUND,
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
        isDeleted: true,
      },
    });
    const shippmentstatus = await this.prisma.shipmentStatus.create({
      data: {
        orderId: order.id,
        addressId: address.id,
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
      return await this.prisma.productVariant.findUnique({
        where: {
          id: product.id,
          isDeleted: false,
        },
      });
    });
    return productDetails;
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
