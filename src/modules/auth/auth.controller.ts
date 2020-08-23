import {
  Controller,
  Post,
  UnauthorizedException,
  Body,
  Inject,
  BadRequestException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { LoginService } from './services/login.service';
import { Login } from './dto/login.dto'

@Controller('auth')
export class AuthController {

  constructor(
    @Inject('CryptoService') private readonly cryptoService,
    private readonly jwtService: JwtService,
    private readonly loginService: LoginService,
  ) { }

  @Post('/login')
  async login(@Body() body: Login) {
    body.email = body.email.toLowerCase()
    body.password = this.cryptoService.encrypt(body.password);
    const response: any = await this.loginService.login(body);

    if (response.error)
      throw new UnauthorizedException(response);

    return { success: 'OK', token: await this.jwtService.sign({ ...response }) }
  }
}
