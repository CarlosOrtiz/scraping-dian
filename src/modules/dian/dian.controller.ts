import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { DianService } from './services/dian.service';
import { ExogenousRut } from './dto/exogenousRut.dto';
import { RutService } from './services/rut.service';
import { ExogenousService } from './services/exogenous.service';
import { RentalDeclarationService } from './services/rentalDeclaration.service';
import { RentalDeclaration } from './dto/rentalDeclaration.dto';

@Controller('dian')
export class DianController {

  constructor(
    private readonly dianService: DianService,
    private readonly rutService: RutService,
    private readonly exogenousService: ExogenousService,
    private readonly rentalDeclarationService: RentalDeclarationService
  ) { }

     @Get('/download/rut')
    async downloadRut(@Query('document') document, @Query('password') password) {
      return this.rutService.downloadRut(document, password);
    }
  
 /*   @Post('/download/rut')
    async downloadRutPost(@Body() body: ExogenousRut) {
      return this.rutService.downloadRut(body.document, body.password);
    } */

  @Post('/download/exogenous')
  async downloadExogenous(@Body() body: ExogenousRut) {
    return this.dianService.downloadExogenousRutVersionOld(body);
  }

  /*   @Get('/download/rut-exogenous')
     async downloadRutExogenousGet(@Query('document') document, @Query('password') password) {
       return this.dianService.downloadExogenousRut(document, password);
     } */

  @Post('/download/rut-exogenous')
  async downloadRutExogenousPost(@Body() body: ExogenousRut) {
    return this.dianService.downloadExogenousRut(body.document, body.password);
  }

  @Post('rental-declaration')
  async rentalDeclaration(@Body() body: RentalDeclaration) {
    return this.rentalDeclarationService.rentalDeclaration(body);
  }

}