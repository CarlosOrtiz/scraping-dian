import { Controller, Request, Get, UseGuards, UnauthorizedException, } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';


@Controller('user')
export class UserController {
  constructor(
  ) { }

  @Get('/profile')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Request() req) {
    return await req.user.id;
  }

}
