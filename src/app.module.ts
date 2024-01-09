import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Note } from './note.entity';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from './users/users.module';
import { RolesGuard } from './users/roles.guard'; // Adjust the path accordingly
import { NoteModule } from './note/note.module';

@Module({
  imports: [ 
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      database: 'digitalnotebook',
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
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: 'APP_GUARD', useClass: RolesGuard }, // Provide RolesGuard as a global guard
  ],
})
export class AppModule {}
