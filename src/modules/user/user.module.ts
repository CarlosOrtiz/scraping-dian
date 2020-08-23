import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserController } from './user.controller';
import { FindService } from './services/find.service';
import { User } from '../../entities/users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User], 'users')
  ],
  controllers: [UserController],
  providers: [
    FindService,
  ],
  exports: []
})
export class UserModule {
}
