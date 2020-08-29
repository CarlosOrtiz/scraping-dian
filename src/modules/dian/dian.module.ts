import { Module } from '@nestjs/common';
import { DianController } from './dian.controller';
import { RutService } from './services/rut.service';
import { DianService } from './services/dian.service';
import { LoginService } from '../auth/services/login.service';
import { ExogenousService } from './services/exogenous.service';
import { RentalDeclarationService } from './services/rentalDeclaration.service';

@Module({
  controllers: [DianController],
  providers: [DianService, LoginService, RutService, ExogenousService, RentalDeclarationService]
})
export class DianModule { }
