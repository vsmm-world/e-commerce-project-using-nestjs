import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ProductsModule } from './products/products.module';
import { CategoryModule } from './category/category.module';
import { ProductVariantModule } from './product_variant/product_variant.module';
import { CartModule } from './cart/cart.module';
import { PaymentModule } from './payment/payment.module';
import { AdressModule } from './adress/adress.module';
import { ShipmentModule } from './shipment/shipment.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UserModule,
    ProductsModule,
    CategoryModule,
    ProductVariantModule,
    CartModule,
    PaymentModule,
    AdressModule,
    ShipmentModule,
  ],
  controllers: [],
  providers: [PrismaModule],
  exports: [PrismaModule],
})
export class AppModule {}
