import { ApiProperty} from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateReviewDto {
  @ApiProperty()
  @IsNotEmpty()
  rating: number;

  @ApiProperty()
  @IsNotEmpty()
  review: string;
}
