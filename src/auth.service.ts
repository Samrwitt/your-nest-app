import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from "./users/entities/user.entity";
import { Repository, FindOneOptions } from "typeorm";

@Injectable()
export class AppService {

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async create(data: any, isAdmin: boolean = false): Promise<User> {
    try {
      data.role = isAdmin ? 'admin' : 'user';
      const newUser = await this.userRepository.save(data);
      return this.findById(newUser.id);
    } catch (error) {
      console.error('Error creating user:', error);
      throw new BadRequestException('User creation failed');
    }
  }

  async findOne(email: string): Promise<User | undefined> {
    console.log('Looking for user with email:', email);

    if (!email) {
      console.error('Invalid email provided to findOne method.');
      throw new BadRequestException('Invalid email provided');
    }

    const options: FindOneOptions<User> = { where: { email } };
    const user = await this.userRepository.findOne(options);

    if (!user) {
      throw new NotFoundException(`User with email '${email}' not found`);
    }

    return user;
  }

  async findById(id: number): Promise<User | undefined> {
    try {
      const user = await this.userRepository.findOneById(id);

      if (!user) {
        throw new NotFoundException(`User with ID '${id}' not found`);
      }

      return user;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw new NotFoundException('User not found');
    }
  }
}
