import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InjectRazorpay } from 'nestjs-razorpay';
import Razorpay from 'razorpay';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRazorpay() private readonly razorpay: Razorpay,
    private prisma: PrismaService,
  ) {}

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
    const products = cart.products;
    const totalPrice = cart.totalPrice;

    const { amount, currency, receipt, CashOnDelivery } = createPaymentDto;
    if (CashOnDelivery) {
      const payment = await this.prisma.payment.create({
        data: {
          customer: {
            connect: { id: customer.id },
          },
          COD: CashOnDelivery,
        },
      });
      await this.createOrder(req);
      return {
        statusCode: 200,
        message: 'Payment created successfully',
        data: { id: 'CashOnDelivery' },
      };
    }
    const options = {
      amount: amount * 100,
      currency,
      receipt,
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
   const order =  await this.createOrder(req);
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

    const productsfromCart = cart.products;

    // const getProducts = async (products) => {
    //   let productDetails = [];
    //   for (let i = 0; i < products.length; i++) {
    //     const product =  this.prisma.product_variant.findUnique({
    //       where: {
    //         id: products[i].id,
    //       },
    //     });
    //     productDetails.push(product);
    //   }
    //   return productDetails;
    // };
    async function getProducts(products){
      let productDetails = [];
      for (let i = 0; i < products.length; i++) {
        const product =  this.prisma.product_variant.findUnique({
          where: {
            id: products[i].id,
          },
        });
        productDetails.push(product);
      }
      return productDetails;
    };

    
    const products = await getProducts(productsfromCart);

    function calculateTotalPrice(products) {
      let totalPrice = 0;
      for (let i = 0; i < products.length; i++) {
        totalPrice += products[i].price;
      }
      return totalPrice;
    }

    function getProductIds(products) {
      let productIds = [];
      for (let i = 0; i < products.length; i++) {
        productIds.push(products[i].id);
      }
      return productIds;
    }

    const productIds = getProductIds(products);
    const totalPrice = calculateTotalPrice(products);
    const totalItems = products.length;

    const payment = await this.prisma.payment.findFirst({
      where: {
        customerId: customer.id,
        isdeleted: false,
      },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    let PaymentStatus = 'Pending';
    let PaymentMethod = 'CashOnDelivery';
    if (payment.COD == false) {
      PaymentMethod = 'Online';
      PaymentStatus = 'Paid';
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
    };
  }
}
