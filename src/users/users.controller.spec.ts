import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { Role } from './entities/role.enum';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        role: Role.User,
      };
      const newUser: User = {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        role: Role.User,
        notes: [],
      };

      jest.spyOn(usersService, 'create').mockResolvedValueOnce(newUser as never);

      const result = await usersController.create(createUserDto);

      expect(result).toEqual({ user: newUser, message: 'User created successfully' });
    });
  });

  describe('findAll', () => {
    it('should return all users', () => {
      const users: User[] = [
        {
          id: 1,
          name: 'John Doe',
          email: 'john.doe@example.com',
          password: 'password123',
          role: Role.User,
          notes: [],
        },
        // Add more mock user data if needed
      ];

      jest.spyOn(usersService, 'findAll').mockReturnValue(Promise.resolve(users));

      const result = usersController.findAll();

      expect(result).toEqual({ users });
    });
  });

  describe('findOne', () => {
    it('should return a user by ID', () => {
      const userId = '1';
      const user: User = {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        role: Role.User,
        notes: [],
      };

      jest.spyOn(usersService, 'findOne').mockReturnValue(Promise.resolve(user));

      const result = usersController.findOne(userId);

      expect(result).toEqual({ user });
    });

    it('should throw NotFoundException if user not found', () => {
      const userId = '999';

      jest.spyOn(usersService, 'findOne').mockReturnValue(null);

      expect(() => usersController.findOne(userId)).toThrowError(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a user', () => {
      const userId = '1';
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
        email: 'updated.email@example.com',
        password: 'updatedPassword123',
        role: Role.User,
      };
      const currentUser: User = {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        role: Role.User,
        notes: [],
      };
      const updatedUser: User = {
        id: 1,
        name: 'Updated Name',
        email: 'updated.email@example.com',
        password: 'updatedPassword123',
        role: Role.User,
        notes: [],
      };

      jest.spyOn(usersService, 'update').mockReturnValue(Promise.resolve(updatedUser));

      const result = usersController.update(userId, updateUserDto, currentUser);

      expect(result).toEqual({ user: updatedUser, message: 'User updated successfully' });
    });

    it('should throw ForbiddenException if the current user does not have permission', () => {
      const userId = '2';
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
  email: 'updated@example.com',
  password: 'updatedPassword',
  role: Role.User, 
};
      const currentUser: User = {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        role: Role.User,
        notes: [],
      };

      jest.spyOn(usersService, 'update').mockImplementation(() => {
        throw new ForbiddenException();
      });

      expect(() => usersController.update(userId, updateUserDto, currentUser)).toThrowError(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should remove a user', () => {
      const userId = '1';
      const currentUser: User = {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        role: Role.User,
        notes: [],
      };

      jest.spyOn(usersService, 'remove');

      const result = usersController.remove(userId, currentUser);

      expect(result).toEqual({ message: 'User deleted successfully' });
    });

    it('should throw ForbiddenException if the current user does not have permission', () => {
      const userId = '2';
      const currentUser: User = {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        role: Role.User,
        notes: [],
      };

      jest.spyOn(usersService, 'remove');

      expect(() => usersController.remove(userId, currentUser)).toThrowError(ForbiddenException);
    });
  });
});
