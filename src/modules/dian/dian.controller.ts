import { Controller, Get, Post, Body } from '@nestjs/common';
import { DianService } from './services/dian.service';
import { ExogenousRut } from './dto/exogenousRut.dto';
import { RentalDeclaration } from './dto/rentalDeclaration.dto';

@Controller('dian')
export class DianController {

  constructor(private readonly dianService: DianService) { }

  @Get()
  async downloadExogenousInformationRutGet(@Body() body: ExogenousRut) {
    return this.dianService.downloadExogenousRut(body);
  }

  @Post()
  async downloadExogenousInformationRutPost(@Body() body: ExogenousRut) {
    return this.dianService.downloadExogenousRut(body);
  }

  @Get('/declaration')
  async rentalDeclaration(@Body() body: RentalDeclaration) {
    return this.dianService.rentalDeclaration(body);
  }

}