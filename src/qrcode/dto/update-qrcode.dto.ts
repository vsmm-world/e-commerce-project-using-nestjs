import { PartialType } from '@nestjs/swagger';
import { CreateQrcodeDto } from './create-qrcode.dto';

export class UpdateQrcodeDto extends PartialType(CreateQrcodeDto) {}
