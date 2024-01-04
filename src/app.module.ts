import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [ 
    TypeOrmModule.forRoot({
      type:'mssql',
      host:'localhost',
      port:1433,
      database: "master",
      entities: [User],
      synchronize: true,
      logging: true,
      extra: {
        integratedSecurity: true,
        trustServerCertificate: true, 
      },
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
