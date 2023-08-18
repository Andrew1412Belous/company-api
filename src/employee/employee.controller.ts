import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { Employee } from './employee.entity';

@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @HttpCode(200)
  @Post()
  create(@Body() body: CreateEmployeeDto): Promise<Employee> {
    return this.employeeService.create(body);
  }

  @Get()
  findAll(): Promise<Employee[]> {
    return this.employeeService.findAll();
  }

  @Get('/:id')
  findById(@Param('id') employeeId: number): Promise<Employee> {
    return this.employeeService.findById(employeeId);
  }

  @Delete('/:id')
  deleteById(@Param('id') id: number): Promise<void> {
    return this.employeeService.deleteById(id);
  }

  @Post(':employeeId/supervisor/:supervisorId')
  async addSupervisor(
    @Param('employeeId') employeeId: number,
    @Param('supervisorId') supervisorId: number,
  ): Promise<Employee> {
    return this.employeeService.addSupervisor(employeeId, supervisorId);
  }

  @Delete(':employeeId/supervisor')
  async removeSupervisor(
    @Param('employeeId') employeeId: number,
  ): Promise<Employee> {
    return this.employeeService.removeSupervisor(employeeId);
  }

  @Put(':employeeId/supervisor/:newSupervisorId')
  async changeSupervisor(
    @Param('employeeId') employeeId: number,
    @Param('newSupervisorId') newSupervisorId: number,
  ): Promise<Employee> {
    return this.employeeService.changeSupervisor(employeeId, newSupervisorId);
  }
}
