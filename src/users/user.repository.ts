import { EntityRepository, Repository } from 'typeorm';
import { User } from './entities/user.entity'; // Adjust the path accordingly
import { NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';


@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async findOneByEmail(email: string): Promise<User | undefined> {
    return this.findOneByEmail( email );
  }
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { name, email, password, role } = createUserDto;
    const newUser = this.create({ name, email, password, role });
    return await this.save(newUser);
  }

  async updateUser(user: User, updateUserDto: UpdateUserDto): Promise<User> {
    const { name, email, password, role } = updateUserDto;
    user.name = name || user.name;
    user.email = email || user.email;
    user.password = password || user.password;
    user.role = role || user.role;
    return await this.save(user);
  }
  async findOneById(id: number): Promise<User | undefined> {
    try {
      const user = await this.findOneById(id );

      if (!user) {
        throw new NotFoundException(`User with ID '${id}' not found`);
      }

      return user;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw new NotFoundException('User not found');
    }
  }

  // Add more custom repository methods if needed
}
