import { Controller, Get, Param, Query } from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { ParseDatePipe } from '../pipes/parse-date.pipe';

@Controller('payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Get('total')
  async calculateTotalSalaries(
    @Query('currentDate', ParseDatePipe) currentDate: string,
  ): Promise<number> {
    const parsedDate = new Date(currentDate);
    return await this.payrollService.calculateTotalSalaries(parsedDate);
  }

  @Get('/:employeeId')
  async calculateSalary(
    @Param('employeeId') employeeId: number,
    @Query('currentDate', ParseDatePipe) currentDate: string,
  ): Promise<number> {
    const date = new Date(currentDate);
    return this.payrollService.calculateSalary(employeeId, date);
  }
}
