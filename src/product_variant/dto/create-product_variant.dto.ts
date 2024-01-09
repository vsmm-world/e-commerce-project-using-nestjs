import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class CreateProductVariantDto {
    @ApiProperty()
    @IsNotEmpty()
    product_id: string;

    @ApiProperty()
    @IsNotEmpty()
    size: string;

    @ApiProperty()
    @IsNotEmpty()
    color: string;

    @ApiProperty()
    @IsNotEmpty()
    stock: number;

    @ApiProperty()
    @IsNotEmpty()
    price: number;
}
