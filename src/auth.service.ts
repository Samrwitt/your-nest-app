import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { Repository, FindOneOptions } from 'typeorm';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(data: any, isAdmin: boolean = false): Promise<User> {
    try {
      data.role = isAdmin ? 'admin' : 'user';
      const newUser = await this.userRepository.save(data);
  
      // Check if user is found before returning
      const foundUser = await this.findById(newUser.id);
  
      if (!foundUser) {
        // Handle the case where the user is not found
        console.error('User not found after creation');
        // You can choose to return newUser or handle the case differently
        // For example, you might want to log the issue and still return newUser
        // return newUser;
      }
  
      return foundUser || newUser;
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
