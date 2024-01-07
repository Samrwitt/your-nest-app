import {   Body, Controller, Post, Get, Req, Res, } from '@nestjs/common';
import { AppService } from './app.service';
import * as bcrypt from 'bcrypt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import {JwtService} from "@nestjs/jwt";
import {Response, Request} from 'express';


@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService,
    private jwtService: JwtService ) {}

    @Post('register')
    async register(
      @Body('name') name: string,
      @Body('email') email: string,
      @Body('password') password: string,
    ) {
      try {
        if (!name) {
          throw new BadRequestException('Name is required');
        }
      
        if (!email) {
          throw new BadRequestException('Email is required');
        }
      
        if (!password) {
          throw new BadRequestException('Password is required');
        }
  
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await this.appService.create({
          name,
          email,
          password: hashedPassword,
        });
        delete user.password;
        return user;
      } catch (error) {
        console.error('Registration Error', error);
        throw new BadRequestException('Registration failed: ' + error.message);
      }
    }
  


    
@Post('login')
async login(
  @Body('email') email: string,
  @Body('password') password: string,
  @Res({ passthrough: true }) response: Response,
) {
  try {
    console.log('Login attempt with email:', email);

    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    const user = await this.appService.findOne(email);
    
    if (!user) {
      throw new BadRequestException('User with this email does not exist');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid password');
    }

    const jwt = await this.jwtService.signAsync({ id: user.id });
    response.cookie('jwt', jwt, { httpOnly: true });
    
    console.log('Login successful');
    return {
      message: 'success',
    };
  } catch (error) {
    console.error('Login Error:', error.message);
    throw new UnauthorizedException('Invalid credentials');
  }
}

  
@Get('user')
async user(@Req() request: Request) {
  try {
    const cookie = request.cookies['jwt'];
    console.log('JWT Cookie:', cookie);
    
    const data = await this.jwtService.verifyAsync(cookie);
    console.log('JWT Decoded Data:', data);

    if (!data || !data['id']) {
      throw new UnauthorizedException('Invalid or missing user ID in JWT payload');
    }

    const userId: string = data['id'] as string;
    console.log('User ID from JWT:', userId);

    const user = await this.appService.findOne(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { password, ...result } = user;
    return result;
  } catch (e) {
    console.error('User Retrieval Error:', e);
    throw new UnauthorizedException('Failed to retrieve user');
  }
}

@Post('logout')
async logout(@Res({ passthrough: true }) response: Response) {
  try {
    response.clearCookie('jwt');
    return {
      message: 'success'
    }
  } catch (e) {
    console.error('Logout Error:', e);
    throw new UnauthorizedException('Logout failed');
  }
 }
}