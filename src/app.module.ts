import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [ 
    TypeOrmModule.forRoot({
      type:'mysql',
      host:'localhost',
      port:3306,
      database: "digitalnotebook",
      entities: [User],
      synchronize: false ,
      logging: true,
     username: "root",
    password:"123321"
    }),
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret:'secret',
      signOptions: {expiresIn:'1d'}
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
