import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { QrCodeService } from './qrcode.service';
import {
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('QR Code')
@Controller('qr-code')
export class QrCodeController {
  constructor(private readonly qrCodeService: QrCodeService) {}

  @Get()
  @ApiOperation({ summary: 'Generate QR Code' })
  @ApiProduces('image/png')
  @ApiOkResponse({
    description: 'QR Code image',
    content: {
      'image/png': {
        schema: { type: 'string', format: 'binary' },
      },
    },
  })
  async generateQrCode(@Query('data') data: string, @Res() res: Response) {
    const qrCodeDataURL = await this.qrCodeService.generateQrCode(data);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', 'inline; filename=qr-code.png');
    const buffer = Buffer.from(qrCodeDataURL.split(',')[1], 'base64');

    // Convert binary image data to data URI
    console.log(buffer);

    // Send the data URI as the response
    return res.send(buffer);
  }
}
