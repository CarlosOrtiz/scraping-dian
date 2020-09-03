import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { DianController } from './dian.controller';
import { DianService } from './services/dian.service';
import { Audit } from '../../entities/security/audit.entity';
import 'dotenv/config';
import { ExogenousProcessor } from './processor/exogenous.processor';
import { IncomeProcessor } from './processor/income.processor';
import { RutProcessor } from './processor/rut.processor';
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
        max: 10,
        duration: 2500,
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
