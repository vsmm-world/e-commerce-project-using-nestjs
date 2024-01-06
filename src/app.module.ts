import { Module } from '@nestjs/common';
import { AdminModule } from './admin/admin.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CustomerModule } from './customer/customer.module';
import { ProductsModule } from './products/products.module';
import { CategoryModule } from './category/category.module';
import { PaymentModule } from './payment/payment.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [AdminModule, PrismaModule, AuthModule, CustomerModule, ProductsModule, CategoryModule, PaymentModule, UserModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
