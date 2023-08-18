import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeService } from './employee.service';
import { Repository } from 'typeorm';
import { Employee } from './employee.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { EmployeeType } from './enums/employee-type.enum';
import { BadRequestException } from '@nestjs/common';

const createEmployeeDto = {
  name: 'John',
  joinDate: new Date('2023-08-12'),
  baseSalary: 50000,
  type: EmployeeType.Employee,
};

describe('EmployeeService', () => {
  let service: EmployeeService;
  let employeeRepository: Repository<Employee>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeService,
        {
          provide: getRepositoryToken(Employee),
          useValue: {
            create: ({
              name,
              joinDate,
              type,
              baseSalary,
            }: CreateEmployeeDto) => {
              return Promise.resolve({
                id: 1,
                name,
                joinDate,
                type,
                baseSalary,
              });
            },
            save: (employee: Employee) => {
              return Promise.resolve(employee);
            },
          },
        },
      ],
    }).compile();

    service = module.get<EmployeeService>(EmployeeService);
    employeeRepository = module.get<Repository<Employee>>(
      getRepositoryToken(Employee),
    );
  });

  it('Create a new employee - success', async () => {
    const employee = await service.create(
      createEmployeeDto as CreateEmployeeDto,
    );
    expect(employee).toBeDefined();
    expect(employee.name).toEqual('John');
  });

  it('Add supervisor to an employee - success', async () => {
    const supervisor = { id: 2, type: EmployeeType.Manager } as Employee;
    const employee = { id: 1, type: EmployeeType.Employee } as Employee;

    jest
      .spyOn(service, 'findById')
      .mockResolvedValueOnce(employee)
      .mockResolvedValueOnce(supervisor);

    const saveMock = jest.fn().mockReturnValue(employee);
    employeeRepository.save = saveMock;

    const result = await service.addSupervisor(employee.id, supervisor.id);

    expect(result).toBe(employee);
    expect(employee.supervisor).toBe(supervisor);
    expect(saveMock).toHaveBeenCalledWith(employee);
  });

  it('Add supervisor to an employee - failed', async () => {
    const supervisor = { id: 2, type: EmployeeType.Manager } as Employee;
    const employee = { id: 1, type: EmployeeType.Employee } as Employee;

    jest
      .spyOn(service, 'findById')
      .mockResolvedValue(supervisor)
      .mockResolvedValue(employee);

    await expect(
      service.addSupervisor(employee.id, supervisor.id),
    ).rejects.toThrowError(BadRequestException);
  });

  it('Remove supervisor from an employee - success', async () => {
    const employee = { id: 1, supervisor: { id: 2 } } as Employee;

    jest.spyOn(service, 'findById').mockResolvedValue(employee);

    const updatedEmployee = await service.removeSupervisor(employee.id);

    expect(updatedEmployee.supervisor).toBeNull();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
