import { Employee } from '../../employee/employee.entity';

export interface SubordinateInfo {
  employee: Employee;
  depth: number;
}
