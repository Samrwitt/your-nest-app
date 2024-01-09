import { Controller, ForbiddenException, Get, Post, Body, UseGuards, Patch, Param, Delete } from '@nestjs/common';
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
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(Role.Admin, Role.User)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles(Role.Admin, Role.User)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.Admin, Role.User)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @Roles(Role.User, Role.Admin)
  remove(@Param('id') id: string, @CurrentUser() currentUser: User) {
    const userId = +id;
    if (currentUser.role === Role.User && currentUser.id !== userId) {
      throw new ForbiddenException('You can only delete your own account.');
    }
    return this.usersService.remove(userId);
  }
}
