import { Module, Global } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { CryptoService } from './services/crypto.service';

import { User } from "../entities/security/user.entity";
import { TokenService } from "./services/token.service";

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([User], 'security'),
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
