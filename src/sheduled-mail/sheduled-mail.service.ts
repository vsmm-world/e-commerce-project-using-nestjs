import { HttpStatus, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { env } from 'process';
import { PrismaService } from '../prisma/prisma.service';
import * as postmark from 'postmark';
import { CommonKeys } from '../shared/keys/common.keys';

@Injectable()
export class SheduledMailService {
  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    const client = new postmark.ServerClient(env.POST_MARK_API_KEY);

    // write fuction for sending mail
    const carts = await this.prisma.cart.findMany({
      where: {
        isDeleted: false,
      },
    });

    const selectedCarts = carts.map((cart) => {
      if (
        new Date().getTime() - new Date(cart.updatedAt).getTime() >
        7 * 24 * 60 * 60 * 1000
      ) {
        if (
          cart.isReminded &&
          new Date().getTime() - new Date(cart.reminderDate).getTime() >
            7 * 24 * 60 * 60 * 1000
        ) {
          return undefined;
        }
        return cart;
      }
    });
    const filteredCarts = selectedCarts.filter((cart) => cart !== undefined);
    // console.log(selectedCarts);

    filteredCarts.forEach(async (cart) => {
      const customer = await this.prisma.customer.findUnique({
        where: {
          id: cart.customerId,
          isDeleted: false,
        },
      });
      if (!customer) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: CommonKeys.CUSTOMER_NOT_FOUND,
        };
      }
      const products = cart.productIds;
      const productDetailspromise = products.map(async (productId: string) => {
        const productvDetails = await this.prisma.productVariant.findUnique({
          where: {
            id: productId,
            isDeleted: false,
          },
        });
        const productDetails = await this.prisma.product.findUnique({
          where: {
            id: productvDetails.productId,
            isDeleted: false,
          },
        });

        return productDetails;
      });
      const productDetails = await Promise.all(productDetailspromise);
      const mail = {
        From: 'rushi@syscreations.com',
        To: customer.email,
        Subject: 'Cart Reminder',
        TextBody: `your products ${productDetails.map(async (product) => {
          product.name;
        })} are still in cart ,
        jaldi purchse karlo , stock khatam ho jayenga fir mat bolna ki nahi bataya `,
      };

      try {
        console.log(mail.TextBody);
        await client.sendEmail(mail).then((res) => {
          console.log(res + 'mail sent');
        });
      } catch (err) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: CommonKeys.GONE_WRONG,
        };
      }
    });
  }
}
