// users/dto/update-user.dto.ts
import { IsString, IsOptional, IsEmail, IsIn } from 'class-validator';
import { Role } from '../entities/role.enum';
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  @IsIn([Role.Admin, Role.User])
  role: Role;
}
