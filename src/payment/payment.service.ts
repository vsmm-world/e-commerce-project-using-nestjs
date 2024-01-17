import { HttpStatus, Injectable } from '@nestjs/common';
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
        isDeleted: false,
      },
    });
    if (!customer) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Customer not found',
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
        message: 'address not found',
      };
    }
    const { product_VarientrId, quantity, CashOnDelivery } = buyNowDto;
    const product = await this.prisma.productVariant.findUnique({
      where: {
        id: product_VarientrId,
        isDeleted: false,
      },
    });
    if (!product) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
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
        statusCode: HttpStatus.OK,
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
      statusCode: HttpStatus.OK,
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
        isDeleted: false,
      },
    });
    if (!customer) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Customer not found',
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
        message: 'Cart not found',
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
        message: 'address not found',
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
        statusCode: HttpStatus.OK,
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
      statusCode: HttpStatus.OK,
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
        statusCode: HttpStatus.BAD_REQUEST,
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
        isDeleted: false,
      },
    });

    if (!payment) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Payment not found',
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
        message: 'address not found',
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
