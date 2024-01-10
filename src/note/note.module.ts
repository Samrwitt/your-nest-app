// note/note.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // Import TypeOrmModule
import { NoteService } from './note.service';
import { NotesController } from './note.controller';
import { Note } from './entities/note.entity'; // Import your entity

@Module({
  imports: [TypeOrmModule.forFeature([Note])], // Include TypeOrmModule with your entity
  controllers: [NotesController],
  providers: [NoteService],
})
export class NoteModule {}
