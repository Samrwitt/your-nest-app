import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeOrm';
import { User } from "./user.entity";
import { Repository, FindOneOptions } from "typeorm";

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async create(data: any): Promise<User> {
    return this.userRepository.save(data);
  }

  async findOne(email: string): Promise<User | undefined> {
    console.log('Looking for user with email:', email);

    if (!email) {
      console.error('Invalid email provided to findOne method.');
      return undefined;
    }

    const options: FindOneOptions<User> = { where: { email } };
    return this.userRepository.findOne(options);
  }
}
