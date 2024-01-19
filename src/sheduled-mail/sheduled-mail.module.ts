import { Module } from '@nestjs/common';
import { SheduledMailService } from './sheduled-mail.service';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [ScheduleModule.forRoot(),PrismaModule],
  providers: [SheduledMailService],
})
export class SheduledMailModule {}
