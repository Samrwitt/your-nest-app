import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/auth.module';

describe('NotesController (e2e)', () => {
  let app;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/notes (POST) - Create a new note', async () => {
    const createNoteDto = {
      title: 'New Note',
      content: 'This is a new note.',
    };

    const response = await request(app.getHttpServer())
      .post('/notes')
      .send(createNoteDto)
      .expect(201);

    expect(response.body).toEqual({
      user: expect.any(Object), // You may need to refine this expectation based on your actual response structure
      message: 'Note created successfully',
    });
  });

  it('/notes (GET) - Get all notes', async () => {
    const response = await request(app.getHttpServer())
      .get('/notes')
      .expect(200);

    expect(response.body).toEqual(expect.any(Array));
  });

  // Add similar tests for other CRUD operations (GET, PATCH, DELETE) as needed
});
