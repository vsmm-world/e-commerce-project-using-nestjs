import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class CreateReviewDto {
    @ApiProperty()
    @IsNotEmpty()
    productVariantId: string;
    
    @ApiProperty()
    @IsNotEmpty()
    rating: number;

    @ApiProperty()
    @IsNotEmpty()
    review: string;
    
}
