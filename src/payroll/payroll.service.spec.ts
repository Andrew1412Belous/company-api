import { Test, TestingModule } from '@nestjs/testing';
import { PayrollService } from './payroll.service';
import { EmployeeService } from '../employee/employee.service';
import { Employee } from '../employee/employee.entity';
import { EmployeeType } from '../employee/enums/employee-type.enum';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

const employeeData = {
  id: 1,
  name: 'John',
  joinDate: new Date('2021-01-01'),
  baseSalary: 50000,
  type: EmployeeType.Employee,
  subordinates: [],
  supervisor: null,
};

describe('PayrollService', () => {
  let service: PayrollService;
  let employeeService: EmployeeService;
  let employeeRepository: Repository<Employee>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayrollService,
        EmployeeService,
        {
          provide: getRepositoryToken(Employee),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PayrollService>(PayrollService);
    employeeService = module.get<EmployeeService>(EmployeeService);
    employeeRepository = module.get<Repository<Employee>>(
      getRepositoryToken(Employee),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateSalary', () => {
    it('should calculate the salary for an employee', async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      jest.spyOn(employeeService, 'findById').mockResolvedValue(employeeData);

      const currentDate = new Date('2025-08-14');
      const salary = await service.calculateSalary(1, currentDate);

      expect(salary).toBe(56000);
    });
  });

  describe('calculateTotalSalaries', () => {
    it('should calculate the total salaries for all employees', async () => {
      const employees = [employeeData, employeeData];
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      jest.spyOn(employeeService, 'findAll').mockResolvedValue(employees);

      const currentDate = new Date('2025-08-14');
      const totalSalaries = await service.calculateTotalSalaries(currentDate);

      expect(totalSalaries).toBe(112000);
    });
  });
});
