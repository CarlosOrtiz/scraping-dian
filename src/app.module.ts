import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './@common/common.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { LanguageModule } from './modules/language/language.module';
import { DianModule } from './modules/dian/dian.module';
import appConfig from './@common/config/app.config';
import sendgridConfig from './@common/config/sendgrid.config';
import typeormConfig from './@common/config/typeorm.config';
import dianConfig from './@common/config/dian.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [appConfig, sendgridConfig, typeormConfig, dianConfig]
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => configService.get('typeorm.users'),
      name: 'users'
    }),
    CommonModule,
    AuthModule,
    UserModule,
    LanguageModule,
    DianModule
  ],
  controllers: [AppController],
  providers: [
    AppService
  ],
})

export class AppModule { }
