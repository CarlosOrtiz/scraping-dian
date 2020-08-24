import { Controller, Get } from '@nestjs/common';
import { DianService } from './services/dian.service';

@Controller('dian')
export class DianController {

  constructor(private readonly dianService: DianService) { }

  @Get()
  async login() {
    return this.dianService.automationProcessPhaseOne();
  }

}
