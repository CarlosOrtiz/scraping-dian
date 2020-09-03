import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { DianService } from './services/dian.service';
import { ExogenousRut } from './dto/exogenousRut.dto';
import { RentalDeclaration } from './dto/rentalDeclaration.dto';


@Controller('dian')
export class DianController {

  constructor(private readonly dianService: DianService) { }

  @Get('/download/rut')
  async downloadRut(@Query('document') document: string, @Query('password') password: string) {
    return this.dianService.downloadRut(document, password);
  }

  @Get('/download/exogenous')
  async downloadExogenous(@Query('document') document: string, @Query('password') password: string) {
    return this.dianService.downloadExogenous(document, password);
  }

  @Get('/download/rut-exogenous')
  async downloadRutExogenous(@Query('document') document: string, @Query('password') password: string) {
    return this.dianService.downloadExogenousRut(document, password);
  }

  @Post('/download/rut')
  async downloadRutPost(@Body() body: ExogenousRut) {
    return this.dianService.downloadRut(body.document, body.password);
  }

  @Post('/download/exogenous')
  async downloadExogenousPost(@Body() body: ExogenousRut) {
    return this.dianService.downloadExogenous(body.document, body.password);
  }

  @Post('/download/rut-exogenous')
  async downloadRutExogenousPost(@Body() body: ExogenousRut) {
    return this.dianService.downloadExogenousRut(body.document, body.password);
  }

  @Post('/rental-declaration')
  async rentalDeclaration(@Body() body: RentalDeclaration) {
    return this.dianService.rentalDeclaration(body);
  }

}