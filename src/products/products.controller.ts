import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('products')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto, @Request() req: any) {
    return this.productsService.create(createProductDto, req);
  }


  @Get()
  findAll(@Request() req: any) {
    return this.productsService.findAll();
  }

  @Get(':productId')
  findOne(@Param('productId') productId: string, @Request() req: any) {
    return this.productsService.findOne(productId,);
  }

  
  @Patch(':productId')
  update(
    @Param('productId') productId: string,
    @Body() updateProductDto: UpdateProductDto,
    @Request() req: any,
  ) {
    return this.productsService.update(productId, updateProductDto, req);
  }

 
  @Delete(':productId')
  remove(@Param('productId') productId: string, @Request() req: any) {
    return this.productsService.remove(productId, req);
  }
}
