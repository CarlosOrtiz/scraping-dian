import { Controller, Get, Post, Body } from '@nestjs/common';
import { DianService } from './services/dian.service';
import { DianDTO } from './dto/dian.dto';

@Controller('dian')
export class DianController {

  constructor(private readonly dianService: DianService) { }

  @Get()
  async downloadExogenousInformationRutGet(@Body() body: DianDTO) {
    return this.dianService.downloadExogenousRut(body);
  }

  @Post()
  async downloadExogenousInformationRutPost(@Body() body: DianDTO) {
    return this.dianService.downloadExogenousRut(body);
  }

  @Get('/test2')
  async test2() {
    return await this.dianService.test2();
  }

}