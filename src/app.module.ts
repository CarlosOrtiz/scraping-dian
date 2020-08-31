import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './@common/common.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { DianModule } from './modules/dian/dian.module';
import appConfig from './@common/config/app.config';
import typeormConfig from './@common/config/typeorm.config';
import dianConfig from './@common/config/dian.config';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'dian',
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [appConfig, typeormConfig, dianConfig]
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => configService.get('typeorm.security'),
      name: 'security'
    }),
    CommonModule,
    AuthModule,
    UserModule,
    DianModule
  ],
  controllers: [AppController],
  providers: [
    AppService
  ],
})

export class AppModule { }
