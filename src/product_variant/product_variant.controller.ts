import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProductVariantService } from './product_variant.service';
import { CreateProductVariantDto } from './dto/create-product_variant.dto';
import { UpdateProductVariantDto } from './dto/update-product_variant.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Product Variants')
@Controller('productVariant')
export class ProductVariantController {
  constructor(private readonly productVariantService: ProductVariantService) {}

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Post()
  create(
    @Body() createProductVariantDto: CreateProductVariantDto,
    @Request() req: any,
  ) {
    return this.productVariantService.create(createProductVariantDto, req);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get()
  findAll() {
    return this.productVariantService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get(':productVariantId')
  findOne(@Param('productVariantId') productVariantId: string) {
    return this.productVariantService.findOne(productVariantId);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Patch(':productVariantId')
  update(
    @Param('productVariantId') productVariantId: string,
    @Body() updateProductVariantDto: UpdateProductVariantDto,
    @Request() req: any,
  ) {
    return this.productVariantService.update(productVariantId, updateProductVariantDto, req);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Delete(':productVariantId')
  remove(@Param('productVariantId') productVariantId: string, @Request() req: any) {
    return this.productVariantService.remove(productVariantId, req);
  }
}
