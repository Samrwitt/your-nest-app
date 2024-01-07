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
      @Res({ passthrough: true }) response: Response
    ) {
    try{
      const user = await this.appService.findOne(email); 
    
        if (!user) {
          throw new BadRequestException('Invalid credentials');
        }
    
        const isPasswordValid = await bcrypt.compare(password, user.password);
    
        if (!isPasswordValid) {
          throw new BadRequestException('Invalid credentials');
        }
    
        const jwt = await this.jwtService.signAsync({ id: user.id });
        response.cookie('jwt', jwt, { httpOnly: true });
    
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
  
    const cookie = request.cookies['jwt'];
    
    const data = await this.jwtService.verifyAsync(cookie);
   

    if (!data) {
      throw new UnauthorizedException();
    }

    const user = await this.appService.findOne(data['id']);
    delete user.password; 

    return user;
  } 



@Post('logout')
async logout(@Res({ passthrough: true }) response: Response) {
  
    response.clearCookie('jwt');
    return {
      message: 'success'
    }
  }
}
