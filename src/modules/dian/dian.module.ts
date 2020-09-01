import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DianController } from './dian.controller';
import { RutService } from './services/rut.service';
import { DianService } from './services/dian.service';
import { LoginService } from '../auth/services/login.service';
import { ExogenousService } from './services/exogenous.service';
import { RentalDeclarationService } from './services/rentalDeclaration.service';
import { Audit } from '../../entities/security/audit.entity';
import { BullModule } from '@nestjs/bull';
import { FuntionQueue } from './services/funtion.queue';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'dian',
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    TypeOrmModule.forFeature([Audit], 'security')
  ],
  providers: [
    DianService,
    LoginService,
    RutService,
    ExogenousService,
    RentalDeclarationService,
    FuntionQueue
  ],
  controllers: [DianController],
})
export class DianModule { }
