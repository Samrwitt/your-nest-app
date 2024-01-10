import { UsersService } from './users.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {User} from "./entities/user.entity";
import {Role} from "./entities/role.enum";
import { UserRepository } from './user.repository';
import { TestingModule, Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
describe('UsersService', () => {
  let usersService: UsersService;
  let userRepository: UserRepository;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UserRepository),
          useClass: UserRepository,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    userRepository = module.get<UserRepository>(getRepositoryToken(UserRepository));
  });


  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password',
        role: Role.User,
      };

      jest.spyOn(userRepository, 'createUser').mockImplementation(async (userDto) => {
        // Assuming createUser method of UserRepository returns a Promise<User>
        return { ...userDto, id: 1 } as User;
      });
      
      const result = await usersService.create(createUserDto);
    
      expect(result).toEqual(createUserDto);
    });
  });

  describe('findAll', () => {
    it('should return an empty array when no users are present', () => {
      const allUsers = usersService.findAll();
      expect(allUsers).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a user by ID', () => {
      const existingUser = { id: 1, name: 'John Doe', email: 'john@example.com', password: 'password', role: 'user', notes: [] };

      usersService['users'] = [existingUser];

      const foundUser = usersService.findOne(1);

      expect(foundUser).toEqual(existingUser);
    });

    it('should throw NotFoundException if user not found', () => {
      expect(() => usersService.findOne(999)).toThrowError(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const existingUser = { id: 1, name: 'John Doe', email: 'john@example.com', password: 'password', role: 'user', notes: [] };
      usersService['users'] = [existingUser];

      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
        role: Role.User,
      };
      const currentUser = { id: 1, name: 'John Doe', email: 'john@example.com', password: 'password', role: 'user', notes: [] } as User;

      const updatedUser = await usersService.update(1, updateUserDto, currentUser);

      expect(updatedUser.name).toBe(updateUserDto.name);
    });


    it('should throw NotFoundException if user not found', () => {
      expect(() => usersService.update(999, {} as UpdateUserDto, {} as any)).toThrowError(NotFoundException);
    });

    it('should throw ForbiddenException if the current user does not have permission', () => {
      const existingUser = { id: 2, name: 'John Doe', email: 'john@example.com', password: 'password', role: 'user', notes: [] };
      usersService['users'] = [existingUser];

      expect(() => usersService.update(2, {} as UpdateUserDto, {
        id: 1,
        name: '',
        email: '',
        password: '',
        role: '',
        notes: []
      })).toThrowError(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should remove a user', () => {
      const existingUser = { id: 1, name: 'John Doe', email: 'john@example.com', password: 'password', role: 'user', notes: [] };
      usersService['users'] = [existingUser];

      usersService.remove(1, {
        id: 1,
        name: '',
        email: '',
        password: '',
        role: '',
        notes: []
      });

      expect(usersService['users']).toEqual([]);
    });

    it('should throw NotFoundException if user not found', () => {
      expect(() => usersService.remove(999, {} as any)).toThrowError(NotFoundException);
    });

    it('should throw ForbiddenException if the current user does not have permission', () => {
      const existingUser = { id: 2, name: 'John Doe', email: 'john@example.com', password: 'password', role: 'user', notes: [] };
      usersService['users'] = [existingUser];

      expect(() => usersService.remove(2, {
        id: 1,
        name: '',
        email: '',
        password: '',
        role: '',
        notes: []
      })).toThrowError(ForbiddenException);
    });
  });
});
