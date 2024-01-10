// users/dto/create-user.dto.ts
import { IsNotEmpty, IsEmail, IsString, IsIn, IsOptional } from 'class-validator';
import { Role } from '../entities/role.enum';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  @IsIn([Role.Admin, Role.User])
  role: Role;
}
