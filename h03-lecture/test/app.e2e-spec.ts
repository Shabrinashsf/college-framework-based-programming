import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { initApp } from '../src/app.init';

describe('Items (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    initApp(app);     // same config as production (pipes, CORS)
    await app.init();
  });

  it('should return empty array initially', async () => {
    const res = await request(app.getHttpServer())
      .get('/items')
      .expect(200);
    expect(res.body).toEqual([]);
  })

  it('should create an item', async () => {
    const res = await request(app.getHttpServer())
      .post('/items')
      .send({ name: 'Item 1', description: 'Description 1' })
      .expect(201);
    expect(res.body).toMatchObject({ id: 1, name: 'Item 1', description: 'Description 1' });
  })

  it('should reject missing name', async () => {
    await request(app.getHttpServer())
      .post('/items')
      .send({ description: 'no name' })
      .expect(400);
  })

  afterEach(async () => {
    await app.close();
  });
});
