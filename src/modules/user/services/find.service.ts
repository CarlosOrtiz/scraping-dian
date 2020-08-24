import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { User } from "../../../entities/security/user.entity";
import { States } from "../../../entities/enums/states.enum";

@Injectable()
export class FindService {
  constructor(
    @InjectRepository(User, 'security') private readonly userRepository: Repository<User>
  ){}

  async getClientsAll() {
    const clients = this.userRepository.createQueryBuilder('user')
      .innerJoinAndSelect('user.client', 'client')
      .where('user.state = :state', { state: States.Active })
      .getMany()
    return clients
  }
}