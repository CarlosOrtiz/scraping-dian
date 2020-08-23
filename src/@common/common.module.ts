import { Module, Global } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { CryptoService } from './services/crypto.service';

import { User } from "../entities/users/user.entity";
import { TokenService } from "./services/token.service";
import { UserModule } from "../modules/user/user.module";

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([User], 'users'),
    UserModule
  ],
  providers: [
    CryptoService,
    TokenService,
  ],
  exports: [
    TokenService,
    CryptoService,
  ]
})
export class CommonModule { }
