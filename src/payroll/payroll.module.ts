import { Module } from '@nestjs/common';
import { PayrollController } from './payroll.controller';
import { PayrollService } from './payroll.service';
import { EmployeeModule } from '../employee/employee.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from '../employee/employee.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Employee]), EmployeeModule],
  controllers: [PayrollController],
  providers: [PayrollService],
})
export class PayrollModule {}
