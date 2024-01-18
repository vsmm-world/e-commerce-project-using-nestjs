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
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto, @Request() req: any) {
    return this.categoryService.create(createCategoryDto, req);
  }

  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':CatergoryId')
  findOne(@Param('CatergoryId') CatergoryId: string) {
    return this.categoryService.findOne(CatergoryId);
  }

  @Patch(':CatergoryId')
  update(
    @Param('CatergoryId') CatergoryId: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Request() req: any,
  ) {
    return this.categoryService.update(CatergoryId, updateCategoryDto, req);
  }

  @Delete(':CatergoryId')
  remove(@Param('CatergoryId') CatergoryId: string, @Request() req: any) {
    return this.categoryService.remove(CatergoryId, req);
  }
}
