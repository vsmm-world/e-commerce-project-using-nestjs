import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class CreateReviewDto {
    @ApiProperty()
    @IsNotEmpty()
    productId: string;
    
    @ApiProperty()
    @IsNotEmpty()
    rating: number;

    @ApiProperty()
    @IsNotEmpty()
    review: string;
    
}
