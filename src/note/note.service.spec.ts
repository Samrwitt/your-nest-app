import { Test, TestingModule } from '@nestjs/testing';
import { NoteService } from './note.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Note } from './entities/note.entity';
import { User } from '../users/entities/user.entity';
import { CreateNoteDto } from './dto/create-note.dto';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

const mockNoteRepository = {
  find: jest.fn(),
  findOneById: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

describe('NoteService', () => {
  let noteService: NoteService;
  let noteRepository: Repository<Note>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NoteService,
        {
          provide: getRepositoryToken(Note),
          useValue: mockNoteRepository,
        },
      ],
    }).compile();

    noteService = module.get<NoteService>(NoteService);
    noteRepository = module.get<Repository<Note>>(getRepositoryToken(Note));
  });

  describe('create', () => {
    it('should create a new note', async () => {
      const createUserDto: CreateNoteDto = {
        title: 'Test Note',
        content: 'Test Content',
      };
      const mockUser: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password',
        role: 'User',
        notes: [],
      };
      const mockCreatedNote: Note = {
        id: 1,
        title: 'Test Note',
        content: 'Test Content',
        user: mockUser,
        createdAt: undefined,
        updatedAt: undefined,
      };

      jest.spyOn(mockNoteRepository, 'create').mockReturnValue(mockCreatedNote);
      jest.spyOn(mockNoteRepository, 'save').mockResolvedValueOnce(mockCreatedNote);

      const result = await noteService.create(mockUser, createUserDto);

      expect(noteRepository.create).toHaveBeenCalledWith({ title: 'Test Note', content: 'Test Content', user: mockUser });
      expect(noteRepository.save).toHaveBeenCalledWith(mockCreatedNote);
      expect(result).toEqual(mockCreatedNote);
    });
  });

  describe('findAll', () => {
    const mockUser: User = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password',
      role: 'User',
      notes: [],
    };
    it('should find all notes for a user', async () => {
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

      jest.spyOn(noteRepository, 'find').mockResolvedValueOnce(mockNotes);

      const result = await noteService.findAll(mockUser);

      expect(mockNoteRepository.find).toHaveBeenCalledWith({ where: { user: mockUser } });
      expect(result).toEqual(mockUser.notes);
    });
  });

  describe('findOne', () => {
    it('should find a note by ID for a user', async () => {
      const mockUser: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password',
        role: 'User',
        notes: [],
      };
      const mockNoteId = 1;
      const mockNote: Note = {
        id: 1,
        title: 'Test Note',
        content: 'Test Content',
        user: mockUser,
        createdAt: undefined,
        updatedAt: undefined,
      };

      jest.spyOn(mockNoteRepository, 'findOneById').mockResolvedValueOnce(mockNote);

      const result = await noteService.findOne(mockUser, mockNoteId);

      expect(mockNoteRepository.findOneById).toHaveBeenCalledWith(mockNoteId);
      expect(result).toEqual(mockNote);
    });

    it('should throw NotFoundException if note not found', async () => {
      const mockUser: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password',
        role: 'User',
        notes: [],
      };
      const mockNoteId = 1;

      jest.spyOn(mockNoteRepository, 'findOneById').mockResolvedValueOnce(undefined);

      await expect(noteService.findOne(mockUser, mockNoteId)).rejects.toThrowError(NotFoundException);
    });

    it('should throw ForbiddenException if user does not have permission', async () => {
      const mockUser: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password',
        role: 'User',
        notes: [],
      };
      const mockNoteId = 2;
      const mockNote: Note = {
        id: 2,
        title: 'Other User Note',
        content: 'Other User Content',
        user: {
          id: 2,
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'password',
          role: 'User',
          notes: [],
        },
        createdAt: undefined,
        updatedAt: undefined,
      };

      jest.spyOn(mockNoteRepository, 'findOneById').mockResolvedValueOnce(mockNote);

      await expect(noteService.findOne(mockUser, mockNoteId)).rejects.toThrowError(ForbiddenException);
    });
  });

  describe('findOneByTitle', () => {
    it('should find a note by title for a user', async () => {
      const mockUser: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password',
        role: 'User',
        notes: [],
      };
      const mockNoteTitle = 'Test Note';
      const mockNote: Note = {
        id: 1,
        title: 'Test Note',
        content: 'Test Content',
        user: mockUser,
        createdAt: undefined,
        updatedAt: undefined,
      };

      jest.spyOn(noteRepository, 'findOne').mockResolvedValueOnce(mockNote);

      const result = await noteService.findOneByTitle(mockUser, mockNoteTitle);

      expect(noteRepository.findOne).toHaveBeenCalledWith({ where: { user: mockUser, title: mockNoteTitle } });
      expect(result).toEqual(mockNote);
    });

    it('should throw NotFoundException if note not found', async () => {
      const mockUser: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password',
        role: 'User',
        notes: [],
      };
      const mockNoteTitle = 'Test Note';

      jest.spyOn(noteRepository, 'findOne').mockResolvedValueOnce(undefined);

      await expect(noteService.findOneByTitle(mockUser, mockNoteTitle)).rejects.toThrowError(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a note', async () => {
      const mockUser: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password',
        role: 'User',
        notes: [],
      };
      const mockNoteId = 1;
      const mockTitle = 'Updated Title';
      const mockContent = 'Updated Content';

      const mockNote: Note = {
        id: 1,
        title: 'Test Note',
        content: 'Test Content',
        user: mockUser,
        createdAt: undefined,
        updatedAt: undefined,
      };

      jest.spyOn(mockNoteRepository, 'findOneById').mockResolvedValueOnce(mockNote);
      jest.spyOn(mockNoteRepository, 'save').mockResolvedValueOnce(mockNote);

      const result = await noteService.update(mockUser, mockNoteId, mockTitle, mockContent);

      expect(mockNoteRepository.findOneById).toHaveBeenCalledWith(mockNoteId);
      expect(mockNoteRepository.save).toHaveBeenCalledWith({ ...mockNote, title: mockTitle, content: mockContent });
      expect(result).toEqual({ ...mockNote, title: mockTitle, content: mockContent });
    });

    it('should throw NotFoundException if note not found', async () => {
      const mockUser: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password',
        role: 'User',
        notes: [],
      };
      const mockNoteId = 1;
      const mockTitle = 'Updated Title';
      const mockContent = 'Updated Content';

      jest.spyOn(mockNoteRepository, 'findOneById').mockResolvedValueOnce(undefined);

      await expect(noteService.update(mockUser, mockNoteId, mockTitle, mockContent)).rejects.toThrowError(NotFoundException);
    });

    it('should throw ForbiddenException if user does not have permission', async () => {
      const mockUser: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password',
        role: 'User',
        notes: [],
      };
      const mockNoteId = 2;
      const mockTitle = 'Updated Title';
      const mockContent = 'Updated Content';

      const mockNote: Note = {
        id: 2,
        title: 'Other User Note',
        content: 'Other User Content',
        user: {
          id: 2,
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'password',
          role: 'User',
          notes: [],
        },
        createdAt: undefined,
        updatedAt: undefined,
      };

      jest.spyOn(mockNoteRepository, 'findOneById').mockResolvedValueOnce(mockNote);

      await expect(noteService.update(mockUser, mockNoteId, mockTitle, mockContent)).rejects.toThrowError(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should remove a note if it exists and the user has permission', async () => {
      const mockUser: User = { id: 1, role: 'User' } as User;
      const mockNote: Note = { id: 1, user: mockUser } as Note;

      (jest.spyOn(noteRepository, 'findOne') as jest.Mock).mockResolvedValueOnce(mockNote);

      await expect(noteService.remove(mockUser, 1)).resolves.not.toThrow();
      expect(mockNoteRepository.remove).toHaveBeenCalledWith(mockNote);
    });

    it('should throw ForbiddenException if user does not have permission', async () => {
      const mockUser: User = { id: 1, role: 'User' } as User;
      const mockNote: Note = { id: 1, user: { id: 2 } as User } as Note;

      (jest.spyOn(noteRepository, 'findOne') as jest.Mock).mockResolvedValueOnce(mockNote);

      await expect(noteService.remove(mockUser, 1)).rejects.toThrowError(ForbiddenException);
      expect(mockNoteRepository.remove).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if note not found', async () => {
      const mockUser: User = { id: 1, role: 'User' } as User;

      (jest.spyOn(noteRepository, 'findOne') as jest.Mock).mockResolvedValueOnce(undefined);

      await expect(noteService.remove(mockUser, 1)).rejects.toThrowError(NotFoundException);
      expect(mockNoteRepository.remove).not.toHaveBeenCalled();
    });
  });

  // Add tests for other methods in NoteService...
});
