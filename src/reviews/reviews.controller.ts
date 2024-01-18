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
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('reviews')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
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

  @Get(':reviewId')
  findOne(@Param('reviewId') reviewId: string, @Request() req: any) {
    return this.reviewsService.findOne(reviewId, req);
  }

  @Patch(':reviewId')
  update(
    @Param('reviewId') reviewId: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @Request() req: any,
  ) {
    return this.reviewsService.update(reviewId, updateReviewDto, req);
  }

  @Delete(':reviewId')
  remove(@Param('reviewId') reviewId: string, @Request() req: any) {
    return this.reviewsService.remove(reviewId, req);
  }
}
