import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AppService', () => {
  let appService: AppService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    appService = module.get<AppService>(AppService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const userToCreate = { name: 'John Doe', email: 'john@example.com', password: 'password', role: 'user' };
      const createdUser = { ...userToCreate, id: 1 };

      jest.spyOn(userRepository, 'save').mockImplementation(async (user) => {
        return { ...user, id: 1 } as User;
      });
      const result = await appService.create(userToCreate);

      expect(result).toEqual(createdUser);
    });

    it('should handle errors during user creation', async () => {
      const userToCreate = { name: 'John Doe', email: 'john@example.com', password: 'password', role: 'user' };

      jest.spyOn(userRepository, 'save').mockRejectedValueOnce(new Error('Some error'));

      await expect(appService.create(userToCreate)).rejects.toThrowError(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should find a user by email', async () => {
      const email = 'john@example.com';
      const userToFind = { name: 'John Doe', email, password: 'password', role: 'user', id: 1 };

      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(userToFind as never);

      const result = await appService.findOne(email);

      expect(result).toEqual(userToFind);
    });

    it('should throw NotFoundException if user not found', async () => {
      const email = 'nonexistent@example.com';

      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(undefined);

      await expect(appService.findOne(email)).rejects.toThrowError(NotFoundException);
    });
  });

  // Add more test cases for other methods if needed

  afterEach(() => {
    jest.clearAllMocks();
  });
});
