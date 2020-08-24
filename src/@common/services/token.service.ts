import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { User } from "../../entities/security/user.entity";
import { States } from "../../entities/enums/states.enum";
import { TokenJwt } from "../strategys/jwt.strategy";

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(User, 'security') private readonly userRepository: Repository<User>,
  ) { }

  serializeToken = async (email) => {
    const user = await this.userRepository.createQueryBuilder('user')
      .select(['user.id', 'user.email'])
      .innerJoinAndSelect('user.person', 'person')
      .innerJoinAndSelect('user.client', 'client')
      .where('user.email = :email AND user.state = :state', { email, state: States.Active })
      .getOne()

    const token: TokenJwt = {
      id: user.id,
      email: user.email,
    }

    return token
  }

  async validateToken(token: TokenJwt): Promise<any> {
    const { email, id } = token

    const user = await this.userRepository.findOne({ id, email, state: States.Active })
    if (!user) {
      throw new UnauthorizedException('invalid or expire token')
    }

    /* const { permissions, roles } = await this.permissionsService.getPermissions(user.id) */

    return { ...token }
  }
}