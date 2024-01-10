// note.controller.ts

import { Controller, Get,  Post, Put, Delete, Param, Body, UseGuards, ForbiddenException, NotFoundException, Patch, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NoteService } from './note.service';
import { Note } from './entities/note.entity';
import { User } from '../users/entities/user.entity';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import {Role} from "../users/entities/role.enum"
import { CurrentUser } from 'src/users/current-user.decorator';
import { Roles } from 'src/users/roles.decorator';

@Controller('notes')
@UseGuards(AuthGuard()) // Example: Use guards as needed
export class NotesController {
  constructor(private readonly noteService: NoteService) {}

  @Post()
  @Roles(Role.User, Role.Admin)
  create(@CurrentUser() currentUser: User, @Body() createNoteDto: CreateNoteDto) {
    const newNote = this.noteService.create(currentUser, createNoteDto);
    return { user: newNote, message: 'Note created successfully' };
  }
  
  @Get()
  @Roles(Role.User, Role.Admin)
  findAll(@CurrentUser() currentUser: User) {
    return this.noteService.findAll(currentUser);
  }

  @Get(':id')
  @Roles(Role.User, Role.Admin)
  findOne(@CurrentUser() currentUser: User, @Param('id') id: string) {
    const noteId = +id;
    return this.noteService.findOne(currentUser, noteId);
  }

  @Get('by-title')
  @Roles(Role.User, Role.Admin)
  findOneByTitle(@CurrentUser() currentUser: User, @Query('title') title: string) {
    return this.noteService.findOneByTitle(currentUser, title);
  }
  
  @Patch(':id')
  @Roles(Role.User, Role.Admin)
  update(@Param('id') id: string, @Body() updateNoteDto: UpdateNoteDto, @CurrentUser() currentUser: User) {
    try {
      const updatedNote = this.noteService.update(currentUser, +id, updateNoteDto.title, updateNoteDto.content);
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
  async remove(@Param('id') id: string, @CurrentUser() currentUser: User) {
    const noteId = +id;
  
    if (currentUser.role === Role.User && currentUser.id !== noteId) {
      throw new ForbiddenException('You can only delete your own notes.');
    }
  
    await this.noteService.remove(currentUser, noteId);
    return { message: 'Note deleted successfully' };
  }
}
