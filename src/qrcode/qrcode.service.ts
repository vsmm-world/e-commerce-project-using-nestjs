// src/qr-code.service.ts
import { Injectable } from '@nestjs/common';
import * as qrcode from 'qrcode';
import { buffer } from 'stream/consumers';

@Injectable()
export class QrCodeService {
  async generateQrCode(data: string): Promise<string> {
    try {
      const qrCodeDataURL = await qrcode.toDataURL(data);


      return qrCodeDataURL;
    } catch (error) {
      throw new Error('Failed to generate QR code.');
    }
  }
}
