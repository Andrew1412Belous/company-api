import {
  IsNotEmpty,
  IsDateString,
  IsNumber,
  IsString,
  IsEnum,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';
import { EmployeeType } from '../enums/employee-type.enum';

export class CreateEmployeeDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsDateString()
  joinDate: Date;

  @IsNotEmpty()
  @IsNumber()
  baseSalary: number;

  @IsNotEmpty()
  @IsEnum(EmployeeType)
  type: EmployeeType;

  @IsNotEmpty()
  @IsNumber()
  supervisorId: number;

  @IsArray()
  @ArrayNotEmpty()
  subordinatesIds: number[];
}
