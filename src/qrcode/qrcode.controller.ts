// // src/qr-code.controller.ts
// import { Controller, Get, Query } from '@nestjs/common';
// import { QrCodeService } from './qrcode.service';
// import { ApiProduces, ApiTags } from '@nestjs/swagger';

// @ApiTags('QR Code')
// @Controller('qr-code')
// export class QrCodeController {
//   constructor(private readonly qrCodeService: QrCodeService) {}

//   @Get()
//   @ApiProduces('image/png')
//   async generateQrCode(@Query('data') data: string) {
//     const qrCodeDataURL = await this.qrCodeService.generateQrCode(data);
//     return `<img src="${qrCodeDataURL}" alt="QR Code" />`;
//   }
// }

import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { QrCodeService } from './qrcode.service';
import { ApiOkResponse, ApiOperation, ApiProduces, ApiTags } from '@nestjs/swagger';

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

    // Send the image data as the response
    return res.send(Buffer.from(qrCodeDataURL.split(',')[1], 'base64'));
  }
}
