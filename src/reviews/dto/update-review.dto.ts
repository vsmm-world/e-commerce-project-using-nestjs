import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateReviewDto } from './create-review.dto';
import { IsNotEmpty } from 'class-validator';

export class UpdateReviewDto {
  @ApiProperty()
  @IsNotEmpty()
  rating: number;

  @ApiProperty()
  @IsNotEmpty()
  review: string;
}
