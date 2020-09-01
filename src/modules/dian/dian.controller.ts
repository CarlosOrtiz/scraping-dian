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
  async downloadRut(@Query('document') document: string, @Query('password') password: string) {
    return this.rutService.downloadRut(document, password);
  }

  @Post('/download/rut')
  async downloadRutPost(@Body() body: ExogenousRut) {
    return this.rutService.downloadRutQueue(body.document, body.password);
  }

  @Get('/download/exogenous')
  async downloadExogenous(@Query('document') document: string, @Query('password') password: string) {
    return this.exogenousService.downloadExogenous(document, password);
  }

  @Post('/download/exogenous')
  async downloadExogenousPost(@Body() body: ExogenousRut) {
    return this.exogenousService.downloadExogenous(body.document, body.password);
  }

  @Get('/download/rut-exogenous')
  async downloadRutExogenous(@Query('document') document: string, @Query('password') password: string) {
    return this.dianService.downloadExogenousRut(document, password);
  }

  @Post('/download/rut-exogenous')
  async downloadRutExogenousPost(@Body() body: ExogenousRut) {
    return this.dianService.downloadExogenousRut(body.document, body.password);
  }
  //si tiene firma o no tiene firma el borrador -> que esta lista para enviar a borrador 
  //cambiar el identificaicon de las preguntas
  //descargar el borrar del formulario 210 respondido 
  //document:
  //retirement_unemployment  millitary_forces_police income_public_university work_rental_income === true  121 - 125
  //Abren campo extras si y no

  /* 
  -> el que no tiene firma le entregamos el definitivo
  -> para el que tiene firma, junto con la declaracion retonar que esta en proceso de firma
  *retiro de cesantias = si se inabilita un campo en la parte de abajo
  *
  */
  @Post('/rental-declaration')
  async rentalDeclaration(@Body() body: RentalDeclaration) {
    return this.rentalDeclarationService.rentalDeclaration(body);
  }

  /* Pruebas Queue*/
  @Get('/download/exogenous-test')
  async downloadExogenousTest(@Body() body: ExogenousRut) {
    return this.dianService.downloadExogenousRutVersionOld(body.document, body.password);
  }

  @Get('/download/rut-test')
  async downloadRutTest(@Query('document') document: string, @Query('password') password: string) {
    return this.rutService.downloadRutQueue(document, password);
  }
}