// root-test.module.ts
import { Module } from '@nestjs/common';
import { NoteModule } from './note.module'; // Import the module you are testing
import { NoteService } from './note.service'; // If needed, you can include additional services for testing
import { NoteRepository } from './note.repository';
@Module({
  imports: [NoteModule], // Include the module you want to test
  providers: [NoteService, NoteRepository], // Include any additional services needed for testing
})
export class RootTestModule {}
