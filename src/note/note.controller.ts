// note/note.controller.ts
import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, ForbiddenException, NotFoundException, Patch, Query } from '@nestjs/common';
import { NoteService } from './note.service';
import { Note } from './entities/note.entity';
import { User } from '../users/entities/user.entity';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Role } from "../users/entities/role.enum";
import { CurrentUser } from '../users/current-user.decorator';
import { Roles } from '../users/roles.decorator';

@Controller('notes')
export class NotesController {
  constructor(private readonly noteService: NoteService) {}

  @Post()
  @Roles(Role.User, Role.Admin)
  async create(@CurrentUser() currentUser: User, @Body() createNoteDto: CreateNoteDto): Promise<{ note: Note, message: string }> {
    const newNote = await this.noteService.create(currentUser, createNoteDto);
    return { note: newNote, message: 'Note created successfully' };
  }

  @Get()
  @Roles(Role.User, Role.Admin)
  async findAll(@CurrentUser() currentUser: User): Promise<Note[]> {
    return this.noteService.findAll(currentUser);
  }

  @Get(':id')
  @Roles(Role.User, Role.Admin)
  async findOne(@CurrentUser() currentUser: User, @Param('id') id: string): Promise<Note | undefined> {
    const noteId = +id;
    const note = await this.noteService.findOne(currentUser, noteId);

    if (!note) {
      throw new NotFoundException('Note not found');
    }
    if (currentUser.role === Role.User && currentUser.id !== note.user.id) {
      throw new ForbiddenException('You do not have permission to access this note.');
    }
    return note;
  }

  @Get('by-title')
  @Roles(Role.User, Role.Admin)
  async findOneByTitle(@CurrentUser() currentUser: User, @Query('title') title: string): Promise<{ note: Note, message: string }> {
    const foundNote = await this.noteService.findOneByTitle(currentUser, title);
    return { note: foundNote, message: 'Note found successfully' };
  }

  @Patch(':id')
  @Roles(Role.User, Role.Admin)
  async update(@Param('id') id: string, @Body() updateNoteDto: UpdateNoteDto, @CurrentUser() currentUser: User): Promise<{ user: Note, message: string }> {
    try {
      const updatedNote = await this.noteService.update(currentUser, +id, updateNoteDto.title, updateNoteDto.content);
      return { user: updatedNote, message: 'Note updated successfully' };
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw new ForbiddenException('You do not have permission to update this note.');
      } else {
        throw new NotFoundException('Note not found');
      }
    }
  }

  @Delete(':id')
  @Roles(Role.User, Role.Admin)
  async remove(@Param('id') id: string, @CurrentUser() currentUser: User): Promise<{ message: string }> {
    const noteId = +id;

    if (currentUser.role === Role.User && currentUser.id !== noteId) {
      throw new ForbiddenException('You can only delete your own notes.');
    }

    await this.noteService.remove(currentUser, noteId);
    return { message: 'Note deleted successfully' };
  }
}
