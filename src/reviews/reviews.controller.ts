import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  create(@Body() createReviewDto: CreateReviewDto, @Request() req: any) {
    return this.reviewsService.create(createReviewDto, req);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.reviewsService.findAll(req);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.reviewsService.findOne(id, req);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @Request() req: any,
  ) {
    return this.reviewsService.update(id, updateReviewDto, req);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.reviewsService.remove(id, req);
  }
}
