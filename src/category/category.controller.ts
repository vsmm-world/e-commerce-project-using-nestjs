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
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('category')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto, @Request() req: any) {
    return this.categoryService.create(createCategoryDto, req);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get(':CatergoryId')
  findOne(@Param('CatergoryId') CatergoryId: string) {
    return this.categoryService.findOne(CatergoryId);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Patch(':CatergoryId')
  update(
    @Param('CatergoryId') CatergoryId: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Request() req: any,
  ) {
    return this.categoryService.update(CatergoryId, updateCategoryDto, req);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Delete(':CatergoryId')
  remove(@Param('CatergoryId') CatergoryId: string, @Request() req: any) {
    return this.categoryService.remove(CatergoryId, req);
  }
}
