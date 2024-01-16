import { Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  create(createReviewDto: CreateReviewDto, req: any) {
    return 'This action adds a new review';
  }

  findAll(req: any) {
    return `This action returns all reviews`;
  }

  findOne(id: string, req: any) {
    return `This action returns a #${id} review`;
  }

  update(id: string, req: any, updateReviewDto: UpdateReviewDto) {
    return `This action updates a #${id} review`;
  }

  remove(id: string, req: any) {
    return `This action removes a #${id} review`;
  }
}
