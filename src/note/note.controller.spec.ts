// note/note.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from './entities/note.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class NoteService {
  constructor(
    @InjectRepository(Note)
    private noteRepository: Repository<Note>,
  ) {}

  async create(user: User, title: string, content: string): Promise<Note> {
    const note = this.noteRepository.create({ title, content, user });
    return this.noteRepository.save(note);
  }

  async findAll(user: User): Promise<Note[]> {
    return this.noteRepository.find({ where: { user } });
  }

  async findOne(user: User, noteId: number): Promise<Note> {
    const note = await this.noteRepository.findOneById(noteId);

    if (!note) {
      throw new NotFoundException(`Note with ID ${noteId} not found`);
    }

    // Check if the user has permission to access this note
    if (user.role === 'User' && note.user.id !== user.id) {
      throw new ForbiddenException('You can only access your own notes.');
    }

    return note;
  }

  async update(user: User, noteId: number, title: string, content: string): Promise<Note> {
    const note = await this.noteRepository.findOneById(noteId);

    if (!note) {
      throw new NotFoundException(`Note with ID ${noteId} not found`);
    }

    // Check if the user has permission to update this note
    if (user.role === 'User' && note.user.id !== user.id) {
      throw new ForbiddenException('You can only update your own notes.');
    }

    note.title = title;
    note.content = content;
    return this.noteRepository.save(note);
  }

  async remove(user: User, noteId: number): Promise<void> {
    const note = await this.noteRepository.findOneById(noteId);

    if (!note) {
      throw new NotFoundException(`Note with ID ${noteId} not found`);
    }

    // Check if the user has permission to delete this note
    if (user.role === 'User' && note.user.id !== user.id) {
      throw new ForbiddenException('You can only delete your own notes.');
    }

    await this.noteRepository.remove(note);
  }
}
