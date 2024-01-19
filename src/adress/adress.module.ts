import { Module } from '@nestjs/common';
import { AdressService } from './adress.service';
import { AdressController } from './adress.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdressController],
  providers: [AdressService],
})
export class AdressModule {}
