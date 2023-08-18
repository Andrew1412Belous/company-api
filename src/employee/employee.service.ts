import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EmployeeType } from './enums/employee-type.enum';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { Employee } from './employee.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { datePattern } from '../regexp/date-format';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  async create(employeeData: CreateEmployeeDto): Promise<Employee> {
    const { supervisorId, subordinatesIds, ...restEmployeeData } = employeeData;

    if (!datePattern.test(String(restEmployeeData.joinDate))) {
      throw new BadRequestException('Invalid date format');
    }

    let supervisor: Employee | undefined;
    if (supervisorId) {
      supervisor = await this.findById(supervisorId);

      if (supervisor.type === EmployeeType.Employee) {
        throw new BadRequestException('An employee cannot be a supervisor');
      }
    }

    const subordinates: Employee[] = [];
    if (subordinatesIds && subordinatesIds.length > 0) {
      for (const subordinateId of subordinatesIds) {
        const existingSubordinate = await this.findById(subordinateId);

        if (existingSubordinate.supervisor) {
          throw new BadRequestException(
            'This employee is already managed by another supervisor',
          );
        }

        subordinates.push(existingSubordinate);
      }
    }

    const newEmployee = this.employeeRepository.create({
      ...restEmployeeData,
      type: employeeData.type,
    });

    if (supervisor) {
      newEmployee.supervisor = supervisor;
    }

    if (subordinates.length > 0) {
      newEmployee.subordinates = subordinates;
    }

    return this.employeeRepository.save(newEmployee);
  }

  async findById(id: number): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { id },
      relations: ['supervisor', 'subordinates'],
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return employee;
  }

  async deleteById(id: number): Promise<void> {
    const employee = await this.findById(id);

    if (employee.subordinates.length > 0) {
      throw new BadRequestException(
        'Cannot delete a manager with subordinates',
      );
    }

    if (employee.supervisor) {
      throw new BadRequestException(
        'Cannot delete a supervisor of other employees',
      );
    }

    await this.employeeRepository.remove(employee);
  }

  async findAll(): Promise<Employee[]> {
    return this.employeeRepository
      .createQueryBuilder('employee')
      .leftJoinAndSelect('employee.supervisor', 'supervisor')
      .leftJoinAndSelect('employee.subordinates', 'subordinates')
      .getMany();
  }

  async addSupervisor(
    employeeId: number,
    supervisorId: number,
  ): Promise<Employee> {
    const employee = await this.findById(employeeId);
    const supervisor = await this.findById(supervisorId);

    if (employee.supervisor) {
      throw new ConflictException('Employee already has a supervisor');
    }

    if (supervisor.type === EmployeeType.Employee) {
      throw new BadRequestException('Supervisor cannot be a regular employee');
    }

    employee.supervisor = supervisor;
    await this.employeeRepository.save(employee);

    return employee;
  }

  async removeSupervisor(employeeId: number): Promise<Employee> {
    const employee = await this.findById(employeeId);

    if (!employee.supervisor) {
      throw new NotFoundException('Employee does not have a supervisor');
    }

    employee.supervisor = null;
    await this.employeeRepository.save(employee);

    return employee;
  }

  async changeSupervisor(
    employeeId: number,
    newSupervisorId: number,
  ): Promise<Employee> {
    const employee = await this.findById(employeeId);
    const newSupervisor = await this.findById(newSupervisorId);

    if (newSupervisor.type === EmployeeType.Employee) {
      throw new NotFoundException('Supervisor cannot be a regular employee');
    }

    if (employee.supervisor === newSupervisor) {
      throw new ConflictException(
        'Employee already has the specified supervisor',
      );
    }

    employee.supervisor = newSupervisor;
    await this.employeeRepository.save(employee);

    return employee;
  }
}
