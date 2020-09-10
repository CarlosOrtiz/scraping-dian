import { Controller, Get, Post, Body, Query, BadRequestException } from '@nestjs/common';
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
    return this.dianService.testPupper(body.document, body.password);
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

    if (body.year_Rental_Declaration === 2019 && body.indicative === 16)
      return await this.dianService.testPupper2(body);
    else if (body.year_Rental_Declaration === 2018 && body.indicative === 14)
      return await this.dianService.testPupper2(body);
    else if (body.year_Rental_Declaration === 2017 && body.indicative === 13)
      return await this.dianService.testPupper2(body);
    else
      throw new BadRequestException({
        error: 'INDICATIVE_YEAR_NOT_FOUND',
        detail: 'Para el año 2019 su indicativo es el 16, para el 2017 es el 14 y para el 2017 es el 13'
      });
  }


}