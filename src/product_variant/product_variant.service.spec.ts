import { Test, TestingModule } from '@nestjs/testing';
import { ProductVariantService } from './product_variant.service';
import { PrismaModule } from '../prisma/prisma.module';

describe('ProductVariantService', () => {
  let service: ProductVariantService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [ProductVariantService],
    }).compile();

    service = module.get<ProductVariantService>(ProductVariantService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
