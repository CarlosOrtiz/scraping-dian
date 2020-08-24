import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { User } from "../../../entities/security/user.entity";
import { TokenService } from "../../../@common/services/token.service";
import { Login } from "../dto/login.dto";

@Injectable()
export class LoginService {
  constructor(
    @InjectRepository(User, 'security') private readonly userRepository: Repository<User>,
    private readonly tokenService: TokenService,
  ) { }

  async login(body: Login) {
    const user = await this.userRepository.findOne({ select: ["id", "email", "state"], relations: ["client"], where: body });

    return await this.tokenService.serializeToken(user.email);
  }
}