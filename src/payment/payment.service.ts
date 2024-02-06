import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { InjectRazorpay } from 'nestjs-razorpay';
import Razorpay from 'razorpay';
import { PrismaService } from '../prisma/prisma.service';
import { BuyNowDto } from './dto/buy-now.dto';
import { PaymentKeys } from '../shared/keys/payment.keys';
import { env } from 'process';
import Stripe from 'stripe';
import { promisify } from 'util';
import * as PDFDocument from 'pdfkit';
import puppeteer from 'puppeteer';
import handlebars from 'handlebars';

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
          customerId: customer.id,
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
          paymentStatus: 'done',
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
        paymentStatus: 'done',
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
          customerId: customer.id,
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

    let PaymentStatus = 'Paid';
    let PaymentMethod = 'Online';
    if (payment.COD) {
      PaymentMethod = 'CashOnDelivery';
      PaymentStatus = 'pending';
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
    const paymentUpdate = await this.prisma.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        isDeleted: true,
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
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
      <meta http-equiv="Content-Style-Type" content="text/css" />
      <title>E-commerce Invoice</title>
      <style type="text/css">
        body {
          font-family: 'Arial', sans-serif;
          font-size: 12pt;
          margin: 0;
          padding: 0;
          background-color: #f3ffe6; /* Lime Background */
        }
    
        .container {
          width: 80%;
          margin: 20px auto;
          background-color: #ffffff; /* White Container */
          padding: 20px;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
        }
    
        h1 {
          color: #80ff80; /* Dark Lime */
          text-align: center;
          border-bottom: 2px solid #80ff80;
          padding-bottom: 10px;
        }
    
        h2 {
          color: #80ff80;
          border-bottom: 1px solid #b3ffb3; /* Lighter Lime */
          padding-bottom: 5px;
          margin-top: 20px;
        }
    
        p {
          margin: 0;
          line-height: 1.5;
        }
    
        span {
          font-family: 'Calibri', sans-serif;
          font-size: 9pt;
          color: #333; /* Dark Text Color */
        }
    
        .lime-text {
          color: #80ff80; /* Dark Lime */
        }
    
        .lime-bg {
          background-color: #e6ffcc; /* Light Lime Background */
        }
    
        .lime-border {
          border: 1px solid #80ff80; /* Dark Lime Border */
        }
    
        .grey-logo {
          fill: #666; /* Grey Color for SVG Logo */
          width: 80px;
          height: 80px;
        }
    
        .user-details {
          display: flex;
          justify-content: space-between;
        }
    
        .table-container {
          margin-top: 20px;
        }
    
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
    
        table, th, td {
          border: 1px solid #b3ffb3; /* Lighter Lime Border for Table */
        }
    
        th, td {
          padding: 10px;
          text-align: left;
        }
    
        .total-section {
          margin-top: 20px;
        }
    
        .payment-details {
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container lime-bg">
        <h1>E-commerce Invoice</h1>
    
        <div class="user-details">
          <svg class="grey-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M7 2v11h10V2H7zm11 0v2h2V2h-2zm0 2v4h2V4h-2zm0 4v5h2V8h-2zm-2 8H8v2h8v-2zm2-3v1a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-1H2v6h20v-6h-2zm1-3v1h2V8h-2zm0-3v1h2V5h-2zM2 4v1h2V4H2zm0 2v1h2V6H2zm0 2v1h2V8H2zm0 2v1h2v-1H2zm0 2v1h2v-1H2z"/></svg>
          <p class="lime-text">User Details:</p>
        </div>
    
        <div class="user-details">
          <p><span>{{customer.name}}</span></p>
          <br>
          <p><span>Email:</span> {{customer.email}}</p>
        </div>
    
        <div class="user-details">
          <p><span>Shipping Address:</span></p>
          <p>{{address.street}}, {{address.city}}, {{address.state}} {{address.zip}} {{address.phone}}</p>
        </div>
    
        <div class="table-container">
          <h2 class="lime-text">Purchased Products</h2>
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Quantity</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {{#cart.products}}
                <tr>
                  <td>{{size}}</td>
                  <td>{{quantity}}</td>
                  <td>{{price}}</td>
                </tr>
              {{/cart.products}}
            </tbody>
          </table>
        </div>
    
        <div class="total-section lime-border">
          <p><span>Total Items:</span> {{cart.totalItems}}</p>
          <p><span>Total Price:</span> {{cart.totalPrice}}</p>
        </div>
    
        <div class="payment-details">
          <h2 class="lime-text">Payment Details</h2>
          <p><span>Payment ID:</span> {{payment.id}}</p>
          <p><span>Payment Method:</span> {{order.paymentMethod}}</p>
          <p><span>Payment Status:</span> {{order.paymentStatus}}</p>
          <p><span>Payment Date:</span> {{payment.createdAt}}</p>
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
