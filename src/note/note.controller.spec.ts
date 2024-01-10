// note.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { NotesController } from './note.controller';
import { NoteService } from './note.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { Note } from './entities/note.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/entities/role.enum';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { UpdateNoteDto } from './dto/update-note.dto';

describe('NotesController', () => {
  let noteController: NotesController;
  let noteService: NoteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotesController],
      providers: [NoteService],
    }).compile();

    noteController = module.get<NotesController>(NotesController);
    noteService = module.get<NoteService>(NoteService);
  });

  describe('create', () => {
    it('should create a new note', async () => {
      const mockUser: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'User',
        notes: [],
        password: '',
      };

      const createNoteDto: CreateNoteDto = {
        title: 'Test Note',
        content: 'Test Content',
      };

      const mockNote: Note = {
        id: 1,
        title: 'Test Note',
        content: 'Test Content',
        user: mockUser,
        createdAt: undefined,
        updatedAt: undefined,
      };

      jest.spyOn(noteService, 'create').mockResolvedValueOnce(mockNote);

      const result = await noteController.create(mockUser, createNoteDto);

      expect(result).toEqual({ user: mockNote, message: 'Note created successfully' });
    });
  });

  describe('findAll', () => {
    it('should find all notes for a user', async () => {
      const mockUser: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'User',
        notes: [{
          id: 1,
          title: 'Note 1',
          content: 'Content 1',
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            role: 'User',
            notes: [],
            password: '',
          },
        }],
        password: '',
      };

      const mockNotes: Note[] = [
        {
          id: 1,
          title: 'Note 1',
          content: 'Content 1',
          user: mockUser,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          title: 'Note 2',
          content: 'Content 2',
          user: mockUser,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      jest.spyOn(noteService, 'findAll').mockResolvedValueOnce(mockNotes);

      const result = await noteController.findAll(mockUser);

      expect(result).toEqual(mockNotes);
    });
  });

  describe('findOne', () => {
    it('should find a note by ID for a user', async () => {
      const mockUser: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'User',
        notes: [],
        password: '',
      };

      const noteId = 1;

      const mockNote: Note = {
        id: 1,
        title: 'Test Note',
        content: 'Test Content',
        user: mockUser,
        createdAt: undefined,
        updatedAt: undefined,
      };

      jest.spyOn(noteService, 'findOne').mockResolvedValueOnce(mockNote);

      const result = await noteController.findOne(mockUser, noteId.toString());

      expect(result).toEqual(mockNote);
    });

    it('should throw NotFoundException for non-existing note', async () => {
      const mockUser: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'User',
        notes: [],
        password: '',
      };

      const noteId = 1;

      jest.spyOn(noteService, 'findOne').mockResolvedValueOnce(null);

      await expect(noteController.findOne(mockUser, noteId.toString())).rejects.toThrowError(NotFoundException);
    });

    it('should throw ForbiddenException for unauthorized access', async () => {
      const mockUser: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'User',
        notes: [],
        password: '',
      };

      const noteId = 2;

      const mockNote: Note = {
        id: 2,
        title: 'Test Note',
        content: 'Test Content',
        user: {
          id: 2, name: 'Another User', email: 'another@example.com', role: 'User', notes: [],
          password: '',
        },
        createdAt: undefined,
        updatedAt: undefined,
      };

      jest.spyOn(noteService, 'findOne').mockResolvedValueOnce(mockNote);

      await expect(noteController.findOne(mockUser, noteId.toString())).rejects.toThrowError(ForbiddenException);
    });
  });

  describe('update', () => {
    it('should update a note by ID for a user', async () => {
      const mockUser: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: Role.User,
        notes: [],
        password: '',
      };

      const noteId = 1;
      const updateNoteDto: UpdateNoteDto = {
        title: 'Updated Note',
        content: 'Updated Content',
      };

      const mockNote = {
        id: noteId,
        title: 'Test Note',
        content: 'Test Content',
        user: mockUser,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(noteService, 'update').mockResolvedValueOnce(mockNote as never); // Corrected type assertion

      const result = await noteController.update(noteId.toString(), updateNoteDto, mockUser);

      expect(result).toEqual({ user: mockNote, message: 'Note updated successfully' });
    });

    it('should throw ForbiddenException for unauthorized update', async () => {
      const mockUser: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: Role.User,
        notes: [],
        password: '',
      };
  
      const noteId = 2; // Assuming this note belongs to another user
  
      const updateNoteDto: UpdateNoteDto = {
        title: 'Updated Note',
        content: 'Updated Content',
      };
  
      jest.spyOn(noteService, 'update').mockImplementation(() => {
        // Simulate ForbiddenException by throwing it
        throw new ForbiddenException('You do not have permission to update this note.');
      });
  
      await expect(() => noteController.update(noteId.toString(), updateNoteDto, mockUser))
        .rejects.toThrowError(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should remove a note by ID for a user', async () => {
      const mockUser: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'User',
        notes: [],
        password: '',
      };

      const noteId = 1;

      // Correct import and spy on the instance method
      const removeSpy = jest.spyOn(noteService, 'remove').mockResolvedValueOnce(undefined);

      const result = await noteController.remove(noteId.toString(), mockUser);

      expect(removeSpy).toHaveBeenCalledWith(mockUser, noteId); // Ensure correct arguments
      expect(result).toEqual({ message: 'Note deleted successfully' });
    });

    it('should throw ForbiddenException for unauthorized deletion', async () => {
      const mockUser: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'User',
        notes: [],
        password: '',
      };

      const noteId = 2; // Assuming this note belongs to another user

      jest.spyOn(noteService, 'remove').mockImplementation(() => {
        // Simulate ForbiddenException by throwing it
        throw new ForbiddenException('You do not have permission to delete this note.');
      });

      await expect(() => noteController.remove(noteId.toString(), mockUser))
        .rejects.toThrowError(ForbiddenException);
    });
  });
});
