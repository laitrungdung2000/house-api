import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication  } from '@nestjs/common';
import * as request from 'supertest';
import { HousesController } from './houses.controller';

describe('HousesController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [HousesController],
      providers: [],
    }).compile();

    app = moduleFixture.createNestApplication();

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /houses', () => {
    it('should upload a file and process it', async () => {
      const response = await request(app.getHttpServer())
        .post('/houses')
        .attach('file', './test/test.csv')
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({data: 3});
    });

    it('should return an error if no file is uploaded', async () => {
      const response = await request(app.getHttpServer())
        .post('/houses')
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body).toHaveProperty('message', 'No file uploaded');
    });
  });
});