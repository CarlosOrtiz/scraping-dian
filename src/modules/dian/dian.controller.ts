import { Controller, Get, Post, Body } from '@nestjs/common';
import { DianService } from './services/dian.service';
import { DianDTO } from './dto/dian.dto';

@Controller('dian')
export class DianController {

  constructor(private readonly dianService: DianService) { }

  @Get()
  async automationProcessPhaseOneGet(@Body() body: DianDTO) {
    return this.dianService.automationProcessPhaseOne(body);
  }

  @Post()
  async automationProcessPhaseOnePost(@Body() body: DianDTO) {
    return this.dianService.automationProcessPhaseOne(body);
  }

}