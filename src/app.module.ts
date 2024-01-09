import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ProductsModule } from './products/products.module';
import { CategoryModule } from './category/category.module';

@Module({
  imports: [PrismaModule, AuthModule, UserModule, ProductsModule, CategoryModule],
  controllers: [],
  providers: [PrismaModule],
  exports: [PrismaModule],
})
export class AppModule {}
