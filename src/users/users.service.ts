// users/users.service.ts

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from './user.repository'; // Adjust the path accordingly
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Role } from './entities/role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const newUser = await this.userRepository.createUser(createUserDto);
    return newUser;
  }

  async findAll(): Promise<User[]> {
    const users = await this.userRepository.find();
    return users;
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOneById(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto, currentUser: User): Promise<User> {
    const userToUpdate = await this.userRepository.findOneById(id);

    if (!userToUpdate) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (currentUser.role !== Role.Admin && currentUser.id !== userToUpdate.id) {
      throw new ForbiddenException('You do not have permission to update this account.');
    }

    const updatedUser = await this.userRepository.updateUser(userToUpdate, updateUserDto);
    return updatedUser;
  }

  async remove(id: number, currentUser: User): Promise<void> {
    const userToRemove = await this.userRepository.findOneById(id);

    if (!userToRemove) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (currentUser.role !== Role.Admin && currentUser.id !== userToRemove.id) {
      throw new ForbiddenException('You do not have permission to delete this account.');
    }

    await this.userRepository.remove(userToRemove);
  }
}
