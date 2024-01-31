import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { InjectRazorpay } from 'nestjs-razorpay';
import Razorpay from 'razorpay';
import { PrismaService } from '../prisma/prisma.service';
import { BuyNowDto } from './dto/buy-now.dto';
import { PaymentKeys } from '../shared/keys/payment.keys';
import { env } from 'process';
import Stripe from 'stripe';
import { createWriteStream } from 'fs';
import { promisify } from 'util';
import * as PDFDocument from 'pdfkit';
import puppeteer from 'puppeteer';
import handlebars from 'handlebars';
import products from 'razorpay/dist/types/products';

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
      throw new NotFoundException(PaymentKeys.CUSTOMER_NOT_FOUND);
    }
    const address = await this.prisma.address.findFirst({
      where: {
        customerId: customer.id,
        isDeleted: false,
      },
    });
    if (!address) {
      throw new NotFoundException(PaymentKeys.ADDRESS_NOT_FOUND);
    }
    const { ProductVariantId, quantity, CashOnDelivery } = buyNowDto;
    const productVariant = await this.prisma.productVariant.findUnique({
      where: {
        id: ProductVariantId,
        isDeleted: false,
      },
    });
    if (!productVariant) {
      throw new NotFoundException(PaymentKeys.PRODUCT_NOT_FOUND);
    }
    const product = await this.prisma.product.findUnique({
      where: {
        id: productVariant.productId,
        isDeleted: false,
      },
    });
    if (!product) {
      throw new NotFoundException(PaymentKeys.PRODUCT_NOT_FOUND);
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
      throw new NotFoundException(PaymentKeys.CUSTOMER_NOT_FOUND);
    }
    const cart = await this.prisma.cart.findFirst({
      where: {
        customerId: customer.id,
        isDeleted: false,
      },
    });

    if (!cart) {
      throw new NotFoundException(PaymentKeys.CART_NOT_FOUND);
    }
    const address = await this.prisma.address.findFirst({
      where: {
        customerId: customer.id,
        isDeleted: false,
      },
    });
    if (!address) {
      throw new NotFoundException(PaymentKeys.ADDRESS_NOT_FOUND);
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

      // this.generatePDF(order);
      this.generatePdf(order, customer, cart, address);

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
    // this.generatePDF(order);
    this.generatePdf(order, customer, cart, address);

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
      throw new NotFoundException(PaymentKeys.CART_NOT_FOUND);
    }
    const productsfromCart = cart.products;
    let promises = [];
    try {
      promises = await this.getProducts(productsfromCart);
    } catch (err) {
      throw new NotFoundException(PaymentKeys.PRODUCT_NOT_FOUND);
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
      throw new NotFoundException(PaymentKeys.PAYMENT_NOT_FOUND);
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
      throw new NotFoundException(PaymentKeys.ADDRESS_NOT_FOUND);
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
      order,
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
  async savePDFToFile(pdfBuffer: Buffer, filePath: string): Promise<void> {
    const writeFileAsync = promisify(require('fs').writeFile);

    try {
      await writeFileAsync(filePath, pdfBuffer);
      console.log(`PDF saved to: ${filePath}`);
    } catch (error) {
      console.error('Error saving PDF:', error);
      throw new Error('Failed to save PDF');
    }
  }

  async generatePDF(flx) {
    const pdfBuffer: Buffer = await new Promise((resolve) => {
      const doc = new PDFDocument({
        size: 'LETTER',
        bufferPages: true,
      });

      // Customize your PDF document
      flx.order.products.forEach((product) => {
        doc.text('Product name : -' + product.name, 100, 100);
        doc.text('Product price : -' + product.price.toString(), 100, 150);
        doc.text('Product color : -' + product.color, 100, 200);
      });

      doc.text('Total Price : -' + flx.order.totalPrice.toString(), 100, 250);
      doc.text('Order Pyment Method : -' + flx.order.paymentMethod, 100, 300);
      doc.text('Payment Status : -' + flx.order.paymentStatus, 100, 350);
      doc.text('Total Items : -' + flx.order.tatalItems.toString(), 100, 400);
      doc.text(
        'Order Time and Date : -' + flx.order.createdAt.toString(),
        100,
        450,
      );

      doc.text(
        'Order Shipment Status : -' + flx.shippmentstatus.status,
        100,
        500,
      );

      doc.text('Cash on Dilevery : -' + flx.payment.COD.toString(), 100, 550);
      doc.text('Payment id  : -' + flx.payment.id, 100, 600);
      doc.text(
        'Payment Time and Date : -' + flx.payment.createdAt.toString(),
        100,
        650,
      );
      doc.end();
      const buffer = [];
      doc.on('data', buffer.push.bind(buffer));
      doc.on('end', () => {
        const data = Buffer.concat(buffer);
        resolve(data);
      });
    });

    // Save the PDF to a file
    await this.savePDFToFile(
      pdfBuffer,
      `./PDFfiles/${Date.now().toString()}.pdf`,
    );
  }
  async generatePdf(
    flx: any,
    customer: any,
    cart: any,
    address: any,
  ): Promise<void> {
    // Load your HTML template
    const template = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f2f2f2;
        }
    
        .container {
          width: 60%;
          margin: 20px auto;
          background-color: #fff;
          padding: 20px;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
        }
    
        h1 {
          color: #333;
          text-align: center;
          border-bottom: 2px solid #3498db;
          padding-bottom: 10px;
        }
    
        h2 {
          color: #3498db;
          border-bottom: 1px solid #ccc;
          padding-bottom: 5px;
          margin-top: 20px;
        }
    
        .product {
          margin-bottom: 15px;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
        }
    
        p {
          margin: 5px 0;
        }
    
        .total {
          margin-top: 20px;
          font-weight: bold;
          font-size: 18px;
          color: #3498db;
          text-align: right;
        }
    
        .footer {
          margin-top: 20px;
          text-align: center;
          color: #777;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Invoice</h1>
    
        <h2>Products</h2>
        {{#order.products}}
          <div class="product">
            <p><strong>Product Name:</strong> {{name}}</p>
            <p><strong>Size:</strong> {{size}}</p>
            <p><strong>Color:</strong> {{color}}</p>
            <p><strong>Price:</strong> {{price}}</p>
          </div>
        {{/order.products}}
    
        <h2>Order Details</h2>
        <p><strong>Total Price:</strong> {{order.totalPrice}}</p>
        <p><strong>Payment Method:</strong> {{order.paymentMethod}}</p>
        <p><strong>Payment Status:</strong> {{order.paymentStatus}}</p>
        <p><strong>Total Items:</strong> {{order.totalItems}}</p>
        <p><strong>Order Time and Date:</strong> {{order.createdAt}}</p>
    
        <h2>Shipment Status</h2>
        <p><strong>Status:</strong> {{shippmentstatus.status}}</p>
    
        <h2>Payment Details</h2>
        <p><strong>Cash on Delivery:</strong> {{payment.COD}}</p>
        <p><strong>Payment ID:</strong> {{payment.id}}</p>
        <p><strong>Payment Time and Date:</strong> {{payment.createdAt}}</p>
    
        <div class="total">
          <p><strong>Total Amount:</strong> {{order.totalPrice}}</p>
        </div>
    
        <div class="footer">
          <p>Thank you for your purchase!</p>
        </div>
      </div>
    </body>
    </html>
    
    
    
  `;

  const products = await this.getProducts(cart.products);
    const data = {
      order: flx.order,
      shippmentstatus: flx.shippmentstatus,
      payment: flx.payment,
      products,
      customer,
      cart,
      address,

    };

    // Compile the template
    const compiledTemplate = handlebars.compile(template);

    // Provide data to the template
    const htmlContent = compiledTemplate(data);

    // Launch a headless browser
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Set the HTML content of the page
    await page.setContent(htmlContent);

    // Generate PDF buffer
    const pdfBuffer = await page.pdf({
      format: 'A4',
    });

    // Save the PDF to a file
    await this.savePDFToFile(
      pdfBuffer,
      `./PDFfiles/${Date.now().toString()}.pdf`,
    );

    // Close the browser
    await browser.close();
  }
}
