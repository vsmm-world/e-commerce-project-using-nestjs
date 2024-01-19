import { Module } from '@nestjs/common';
import { ProductVariantService } from './product_variant.service';
import { ProductVariantController } from './product_variant.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProductVariantController],
  providers: [ProductVariantService],
})
export class ProductVariantModule {}
