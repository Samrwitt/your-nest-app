// note/note.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Note } from './entities/note.entity';
import { NoteRepository } from './note.repository';
import { NotesController } from './note.controller';
import { NoteService } from './note.service';

@Module({
  imports: [TypeOrmModule.forFeature([Note, NoteRepository])],
  controllers: [NotesController],
  providers: [NoteService],
})
export class NoteModule {}
