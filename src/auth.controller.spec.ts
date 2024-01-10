import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './auth.controller';
import { AppService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Response, Request } from 'express';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { User } from "./users/entities/user.entity";

jest.mock('bcrypt');

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService, JwtService],
    }).compile();

    appController = module.get<AppController>(AppController);
    appService = module.get<AppService>(AppService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('register', () => {
    it('should throw BadRequestException if name is not provided', async () => {
      await expect(appController.register(undefined, 'test@example.com', 'password123', 'user')).rejects.toThrowError(BadRequestException);
    });

    it('should throw BadRequestException if email is not provided', async () => {
      await expect(appController.register('John Doe', undefined, 'password123', 'user')).rejects.toThrowError(BadRequestException);
    });

    it('should throw BadRequestException if password is not provided', async () => {
      await expect(appController.register('John Doe', 'test@example.com', undefined, 'user')).rejects.toThrowError(BadRequestException);
    });

    it('should register a new user', async () => {
      const user: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword',
        role: 'user',
        notes: [],
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      jest.spyOn(appService, 'create').mockResolvedValue(user);

      const result = await appController.register(user.name, user.email, 'password123', user.role);

      expect(result).toEqual(user);
    });
  });

  describe('login', () => {
    it('should throw BadRequestException for invalid email', async () => {
      const email = 'nonexistent@example.com';
      const password = 'password123';
      const response: Partial<Response & { cookie: (name: string, value: string, options?: any) => void }> = {
        cookie: jest.fn(),
      };
      
      jest.spyOn(appService, 'findOne').mockResolvedValue(null);

      await expect(appController.login(email, password, response as Response)).rejects.toThrowError(BadRequestException);
    });

    it('should throw BadRequestException for invalid password', async () => {
      const email = 'valid@example.com';
      const password = 'invalidPassword';
      const response: Partial<Response> = {
        cookie: jest.fn(),
      };

      jest.spyOn(appService, 'findOne').mockResolvedValue({ id: 1, email, password: 'validPassword' } as User);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(Promise.resolve(false) as never);

      await expect(appController.login(email, password, response as Response)).rejects.toThrowError(BadRequestException);
    });

    it('should login successfully and set JWT cookie', async () => {
      const email = 'valid@example.com';
      const password = 'validPassword';
      const response: Partial<Response> & { cookie: (name: string, value: string, options: any) => void } = {
        cookie: jest.fn(),
      };
    
      const jwtServiceInstance = new JwtService();
      jest.spyOn(appService, 'findOne').mockResolvedValue({ id: 1, email, password: 'hashedPassword' } as User);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(Promise.resolve(true) as never);
      jest.spyOn(jwtServiceInstance, 'signAsync').mockResolvedValue('jwtToken');
    
      const result = await appController.login(email, password, response as Response);
    
      expect(result).toEqual({ message: 'success' });
      expect(response.cookie).toHaveBeenCalledWith('jwt', 'jwtToken', { httpOnly: true });
    });    
  });

  describe('user', () => {
    it('should throw UnauthorizedException for invalid token', async () => {
      const request: Partial<Request> = {
        cookies: {
          jwt: 'invalidToken',
        },
      };

      (jest.spyOn(jwtService, 'verifyAsync') as jest.Mock).mockResolvedValue(null);

      await expect(appController.user(request as Request)).rejects.toThrowError(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const request: Partial<Request> = {
        cookies: {
          jwt: 'validToken',
        },
      };

      (jest.spyOn(jwtService, 'verifyAsync') as jest.Mock).mockResolvedValue({ id: 1 });

      await expect(appController.user(request as Request)).rejects.toThrowError(UnauthorizedException);
    });

    it('should get user information successfully', async () => {
      const request: Partial<Request> = {
        cookies: {
          jwt: 'validToken',
        },
      };

      const userData = { id: 1, name: 'John Doe' };

      (jest.spyOn(jwtService, 'verifyAsync') as jest.Mock).mockResolvedValue(userData);
      (appService.findOne as jest.Mock).mockResolvedValue(userData);

      const result = await appController.user(request as Request);

      expect(result).toEqual(userData);
    });
  });

  describe('logout', () => {
    it('should logout successfully and clear JWT cookie', () => {
      const response: Partial<Response> = {
        clearCookie: jest.fn(),
      };

      const result = appController.logout(response as Response);

      expect(response.clearCookie).toHaveBeenCalledWith('jwt');
      expect(result).toEqual({ message: 'success' });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
