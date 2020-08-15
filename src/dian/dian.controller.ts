import { Controller, Get } from '@nestjs/common';
import { DianService } from './dian.service';

@Controller('dian')
export class DianController {

  constructor(private readonly dianService: DianService) { }

  @Get()
  async login() {
    return await this.dianService.login();
  }

}
