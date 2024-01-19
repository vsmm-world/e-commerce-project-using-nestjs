import { Test, TestingModule } from '@nestjs/testing';
import { ProductVariantController } from './product_variant.controller';
import { ProductVariantService } from './product_variant.service';

describe('ProductVariantController', () => {
  let controller: ProductVariantController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductVariantController],
      providers: [ProductVariantService],
    }).compile();

    controller = module.get<ProductVariantController>(ProductVariantController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
