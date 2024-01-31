import { CreateTestDto } from './dto/create-test.dto';
import { Injectable } from '@nestjs/common';
import { createWriteStream } from 'fs';
import { promisify } from 'util';
import * as PDFDocument from 'pdfkit';

@Injectable()
export class TestService {
  async generatePDF(): Promise<Buffer> {
    const pdfBuffer: Buffer = await new Promise((resolve) => {
      const doc = new PDFDocument({
        size: 'LETTER',
        bufferPages: true,
      });

      // Customize your PDF document
      doc.text('hello world', 100, 50);
      doc.end();

      const buffer = [];
      doc.on('data', buffer.push.bind(buffer));
      doc.on('end', () => {
        const data = Buffer.concat(buffer);
        resolve(data);
      });
    });

    // Save the PDF to a file
    await this.savePDFToFile(pdfBuffer, `./PDFfiles/test.pdf`);

    return pdfBuffer;
  }

  private async savePDFToFile(
    pdfBuffer: Buffer,
    filePath: string,
  ): Promise<void> {
    const writeFileAsync = promisify(require('fs').writeFile);

    try {
      await writeFileAsync(filePath, pdfBuffer);
      console.log(`PDF saved to: ${filePath}`);
    } catch (error) {
      console.error('Error saving PDF:', error);
      throw new Error('Failed to save PDF');
    }
  }
  create(createTestDto: CreateTestDto) {
    return 'This action adds a new test';
  }
}
