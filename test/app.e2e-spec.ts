import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { EmployeeType } from '../src/employee/enums/employee-type.enum';
import { CreateEmployeeDto } from '../src/employee/dto/create-employee.dto';

const createEmployeeDto = {
  name: 'John',
  joinDate: new Date('2023-08-12'),
  baseSalary: 50000,
  type: EmployeeType.Employee,
};

const createManagerDto = {
  name: 'Manager',
  joinDate: new Date('2023-08-12'),
  baseSalary: 60000,
  type: EmployeeType.Manager,
  subordinates: [1],
};

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('success create employee', async () => {
    const { body } = await request(app.getHttpServer())
      .post('/employees')
      .send(createEmployeeDto as CreateEmployeeDto)
      .expect(200);
    expect(body.name).toBe('John');
  });

  it('success getting employee salary', () => {
    return request(app.getHttpServer())
      .get('/payroll/1?currentDate=2025-08-14')
      .expect(200)
      .expect('53000');
  });

  it('fail getting employee salary', () => {
    return request(app.getHttpServer())
      .get('/payroll/1?currentDate=2025.08-14')
      .expect(400, {
        message: 'Invalid date format',
        error: 'Bad Request',
        statusCode: 400,
      });
  });

  it('success create manager', async () => {
    const { body } = await request(app.getHttpServer())
      .post('/employees')
      .send(createManagerDto)
      .expect(200);
    expect(body.name).toBe('Manager');
  });

  it('success get total salary', async () => {
    return request(app.getHttpServer())
      .get('/payroll/total?currentDate=2025-08-14')
      .expect(200)
      .expect(({ text }) => {
        expect(text).toBeDefined();
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
