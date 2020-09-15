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
  async downloadRutExogenous(@Query('document') document: string, @Query('password') password: string, @Query('uid') uid: string, @Query('year') year: number) {
    if (!document)
      throw new BadRequestException({
        error: 'DOCUMENT_IS_NULL',
        detail: 'El campo de document se encuentra vacio.'
      })

    if (!password)
      throw new BadRequestException({
        error: 'PASSWORD_IS_NULL',
        detail: 'El campo de password se encuentra vacio.'
      });

    if (!uid)
      throw new BadRequestException({
        error: 'UID_IS_NULL',
        detail: 'El campo de uid se encuentra vacio.'
      });

    if (year < 2015 || year > 2019)
      throw new BadRequestException({
        error: 'YEAR_NOT_PERMITTED',
        detail: 'El año ingresado no es permitido.'
      });

    return this.dianService.downloadExogenousRut(document, password, uid, year);
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
    if (body.year < 2015 || body.year > 2019)
      throw new BadRequestException({
        error: 'YEAR_NOT_PERMITTED',
        detail: 'El año ingresado no es permitido.'
      });

    return this.dianService.downloadExogenousRut(body.document, body.password, body.uid, body.year);
  }

  @Post('/rental-declaration')
  async rentalDeclaration(@Body() body: RentalDeclaration) {

    if (body.year_Rental_Declaration === 2019 && body.indicative === 16)
      return await this.dianService.rentalDeclaration(body);
    else if (body.year_Rental_Declaration === 2018 && body.indicative === 14)
      return await this.dianService.rentalDeclaration(body);
    else if (body.year_Rental_Declaration === 2017 && body.indicative === 13)
      return await this.dianService.rentalDeclaration(body);
    else
      throw new BadRequestException({
        error: 'INDICATIVE_YEAR_NOT_FOUND OR RENTAL_DECLARATION_ALREADY_CREATED',
        detail: 'Para el año 2019 su indicativo es el 16, para el 2017 es el 14 y para el 2017 es el 13'
      });
  }


}