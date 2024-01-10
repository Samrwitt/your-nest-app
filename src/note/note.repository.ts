// note/repositories/note.repository.ts
import { EntityRepository, Repository } from 'typeorm';
import { Note } from './entities/note.entity';
import { User } from './../users/entities/user.entity';

@EntityRepository(Note)
export class NoteRepository extends Repository<Note> {
  async findNotesByUser(user: User): Promise<Note[]> {
    return this.find({ where: { user } });
  }

  async findNoteByIdAndUser(noteId: number, user: User): Promise<Note | undefined> {
    return this.findOne({ where: { id: noteId, user } });
  }

  async findNoteByTitleAndUser(title: string, user: User): Promise<Note | undefined> {
    return this.findOne({ where: { title, user } });
  }
}
