import { Controller, Post, Body, Inject, Query, Get } from '@nestjs/common';
import { LoginService } from './services/login.service';
import { Login } from './dto/login.dto'

@Controller('auth')
export class AuthController {

  constructor(
    private readonly loginService: LoginService,
  ) { }

  @Post('/login')
  async login(@Body() body: Login) {
    return await this.loginService.loginPost(body);
  }

  @Get('/login')
  async loginGet(@Query('document') document, @Query('password') password) {
    return await this.loginService.loginGet(document, password);
  }
}
