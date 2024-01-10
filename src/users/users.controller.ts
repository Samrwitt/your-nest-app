import { Controller, NotFoundException, ForbiddenException, Get, Post, Body, UseGuards, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from './entities/role.enum';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { User } from './entities/user.entity';
import { CurrentUser } from './current-user.decorator';

@Roles(Role.User)
@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(Role.Admin, Role.User)
  create(@Body() createUserDto: CreateUserDto) {
    const newUser = this.usersService.create(createUserDto);
    return { user: newUser, message: 'User created successfully' };
  }

  @Get()
  @Roles(Role.Admin, Role.User)
  findAll() {
    const users = this.usersService.findAll();
    return { users };
  }

  @Get(':id')
  @Roles(Role.Admin, Role.User)
  findOne(@Param('id') id: string) {
    try {
      const user = this.usersService.findOne(+id);
      return { user };
    } catch (error) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  @Patch(':id')
  @Roles(Role.Admin, Role.User)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @CurrentUser() currentUser: User) {
    const userId = +id;

    try {
      const updatedUser = this.usersService.update(userId, updateUserDto, currentUser);
      return { user: updatedUser, message: 'User updated successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(`User with ID ${id} not found`);
      } else if (error instanceof ForbiddenException) {
        throw new ForbiddenException('You do not have permission to update this account.');
      } else {
        throw error;
      }
    }
  }

  @Delete(':id')
  @Roles(Role.User, Role.Admin)
  remove(@Param('id') id: string, @CurrentUser() currentUser: User) {
    const userId = +id;

    try {
      this.usersService.remove(userId, currentUser);
      return { message: 'User deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(`User with ID ${id} not found`);
      } else if (error instanceof ForbiddenException) {
        throw new ForbiddenException('You do not have permission to delete this account.');
      } else {
        throw error;
      }
    }
  }
}
