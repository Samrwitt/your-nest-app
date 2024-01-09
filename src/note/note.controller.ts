// notes.controller.ts

import { Controller, Get, Post,  Body, Param, Patch, Delete, UseGuards, ForbiddenException } from '@nestjs/common';
import { NoteService } from './note.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { User } from '../user.entity';
import { CurrentUser } from '../users/current-user.decorator';
import { Roles } from '../users/roles.decorator';
import { RolesGuard } from '../users/roles.guard';
import { Role } from '../users/entities/role.enum';

@UseGuards(RolesGuard)
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NoteService) {}

  @Post()
  @Roles(Role.User, Role.Admin)
  create(@CurrentUser() currentUser: User, @Body() createNoteDto: CreateNoteDto) {
    return this.notesService.create(
      currentUser,
      createNoteDto.title,    // Pass title as an argument
      createNoteDto.content,  // Pass content as an argument
    );
  }

  @Get()
  @Roles(Role.User, Role.Admin)
  findAll(@CurrentUser() currentUser: User) {
    return this.notesService.findAll(currentUser);
  }

  @Get(':id')
  @Roles(Role.User, Role.Admin)
  findOne(@CurrentUser() currentUser: User, @Param('id') id: string) {
    const noteId = +id;
    return this.notesService.findOne(currentUser, noteId);
  }
  
  @Patch(':id')
  @Roles(Role.User, Role.Admin)
  async update(
    @CurrentUser() currentUser: User,
    @Param('id') id: string,
    @Body() updateNoteDto: CreateNoteDto,
  ) {
    return await this.notesService.update(
      currentUser,
      +id,
      updateNoteDto.title,  // Pass title as an argument
      updateNoteDto.content, // Pass content as an argument
    );
  }
  

  @Delete(':id')
  @Roles(Role.User, Role.Admin)
  remove(@CurrentUser() currentUser: User, @Param('id') id: string) {
    const noteId = +id;

    // Users can only delete their own notes
    if (currentUser.role === Role.User) {
      throw new ForbiddenException('You can only delete your own notes.');
    }

    return this.notesService.remove(currentUser, noteId);
  }
}
 