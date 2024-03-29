import 'dotenv/config';
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DianController } from './dian.controller';
import { DianService } from './services/dian.service';
import { RutProcessor } from './processor/rut.processor';
import { Audit } from '../../entities/security/audit.entity';
import { IncomeProcessor } from './processor/income.processor';
import { ExogenousProcessor } from './processor/exogenous.processor';
import { RutExogenousProcessor } from './processor/rutExogenous.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'dian',
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true
      },
      limiter: {
        max: 1,
        duration: 35000,
        bounceBack: false
      },
      redis: {
        host: process.env.REDIS_HOST,
        port: +process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD
      },
    }),
    TypeOrmModule.forFeature([Audit], 'security')
  ],
  providers: [
    DianService,
    ExogenousProcessor,
    IncomeProcessor,
    RutProcessor,
    RutExogenousProcessor,
  ],
  controllers: [DianController],
})
export class DianModule { }
