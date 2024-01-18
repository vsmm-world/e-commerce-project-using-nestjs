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
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('cart')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  create(@Body() createCartDto: CreateCartDto, @Request() req: any) {
    return this.cartService.create(createCartDto, req);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.cartService.findAll(req);
  }

  @Patch(':CartId')
  update(
    @Param('CartId') CartId: string,
    @Body() updateCartDto: UpdateCartDto,
    @Request() req: any,
  ) {
    return this.cartService.update(CartId, updateCartDto, req);
  }

  @Delete(':productId')
  remove(@Param('productId') id: string, @Request() req: any) {
    return this.cartService.remove(id, req);
  }
}
