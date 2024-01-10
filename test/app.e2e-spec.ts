import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/auth.module';

describe('AppController (e2e)', () => {
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

  it('/api/register (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/register')
      .send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'user',
      })
      .expect(201) // Assuming you return 201 Created on successful registration
      .expect((res) => {
        // You can make additional assertions here
        expect(res.body.name).toBe('John Doe');
      });
  });

  it('/api/login (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/login')
      .send({
        email: 'john@example.com',
        password: 'password123',
      })
      .expect(200)
      .expect('Set-Cookie', /jwt=/); // Assuming you set a cookie on successful login
  });

  it('/api/user (GET)', async () => {
    // Log in user first
    const loginResponse = await request(app.getHttpServer())
      .post('/api/login')
      .send({
        email: 'john@example.com',
        password: 'password123',
      });

    const cookie = loginResponse.headers['set-cookie'][0];

    // Now make a request to /api/user with the received cookie
    return request(app.getHttpServer())
      .get('/api/user')
      .set('Cookie', cookie)
      .expect(200)
      .expect((res) => {
        expect(res.body.name).toBe('John Doe');
      });
  });

  it('/api/logout (POST)', async () => {
    // Log in user first
    const loginResponse = await request(app.getHttpServer())
      .post('/api/login')
      .send({
        email: 'john@example.com',
        password: 'password123',
      });

    const cookie = loginResponse.headers['set-cookie'][0];

    // Now make a request to /api/logout with the received cookie
    return request(app.getHttpServer())
      .post('/api/logout')
      .set('Cookie', cookie)
      .expect(200)
      .expect('Set-Cookie', /jwt=/); // Assuming you clear the cookie on logout
  });
});
