import { Module } from '@nestjs/common';
import { AppController } from './auth.controller';
import { AppService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { Note } from './note/entities/note.entity';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from './users/users.module';
import { RolesGuard } from './users/roles.guard'; // Adjust the path accordingly
import { NoteModule } from './note/note.module';
import { truncate } from 'fs/promises';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [ 
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      database: 'echo',
      entities: [User, Note],
      synchronize: false,
      logging: true,
      username: 'root',
      password: '123321',
    }),
    TypeOrmModule.forFeature([User, Note]),
    JwtModule.register({
      secret: 'secret',
      signOptions: { expiresIn: '1d' },
    }),
    UsersModule,
    NoteModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: 'APP_GUARD', useClass: RolesGuard }, // Provide RolesGuard as a global guard
  ],
})
export class AppModule {}
