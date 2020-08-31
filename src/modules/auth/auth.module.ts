import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { JwtStrategy } from '../../@common/strategys/jwt.strategy';
import { User } from '../../entities/security/user.entity';
import { LoginService } from './services/login.service';
import { Audit } from '../../entities/security/audit.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Audit], 'security'),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_KEY'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRE') }
      })
    })
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    LoginService,
  ]
})
export class AuthModule { }
