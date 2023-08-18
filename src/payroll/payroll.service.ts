import { Injectable } from '@nestjs/common';
import { EmployeeService } from '../employee/employee.service';
import { Employee } from '../employee/employee.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EmployeeType } from '../employee/enums/employee-type.enum';
import { EmployeeTypeData } from './interfaces/employee-type-data.interface';
import { SubordinateInfo } from './interfaces/subordinate-info.interface';

@Injectable()
export class PayrollService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    private readonly employeeService: EmployeeService,
  ) {}

  private readonly employeeTypeData: Record<EmployeeType, EmployeeTypeData> = {
    [EmployeeType.Manager]: {
      bonusPercentFromSubordinates: 0.005,
      bonusPercentForYear: 0.05,
      salaryLimit: 1.4,
    },
    [EmployeeType.Salesperson]: {
      bonusPercentFromSubordinates: 0.003,
      bonusPercentForYear: 0.01,
      salaryLimit: 1.35,
    },
    [EmployeeType.Employee]: {
      bonusPercentFromSubordinates: 0,
      bonusPercentForYear: 0.03,
      salaryLimit: 1.3,
    },
  };

  async calculateSalary(
    employeeId: number,
    currentDate: Date,
  ): Promise<number> {
    const employee = await this.employeeService.findById(employeeId);

    const baseSalary = await this.calculateBaseSalary(employee, currentDate);

    return Number(baseSalary.toFixed(2));
  }

  async calculateTotalSalaries(currentDate: Date): Promise<number> {
    const employees = await this.employeeService.findAll();
    let totalSalary = 0;

    for (const employee of employees) {
      const employeeSalary = await this.calculateBaseSalary(
        employee,
        currentDate,
      );

      totalSalary += employeeSalary;
    }

    return Number(totalSalary.toFixed(2));
  }

  private async calculateBaseSalary(employee: Employee, currentDate: Date) {
    const employeeTypeData = this.employeeTypeData[employee.type];
    const yearsOfWork = this.calculateYearsOfWork(
      new Date(employee.joinDate),
      currentDate,
    );

    let baseSalary = employee.baseSalary;
    const maxSalary = this.calculateMaxSalary(
      baseSalary,
      employeeTypeData.salaryLimit,
    );
    let subordinateBonus = 0;

    if (employee.type !== EmployeeType.Employee) {
      if (employee.type === EmployeeType.Manager) {
        subordinateBonus = await this.calculateManagerSubordinatesBonus(
          employee,
          yearsOfWork,
          3,
        );
      } else {
        subordinateBonus = await this.calculateSubordinatesBonus(
          {
            employee,
            depth: 0,
          } as SubordinateInfo,
          yearsOfWork,
          3,
        );
      }
    }

    baseSalary += this.calculateBonusFromYears(
      baseSalary,
      employeeTypeData.bonusPercentForYear,
      yearsOfWork,
    );
    baseSalary = Math.min(maxSalary, baseSalary);
    baseSalary += this.calculateBonusFromSubordinates(
      subordinateBonus,
      employeeTypeData.bonusPercentFromSubordinates,
    );

    return baseSalary;
  }

  private calculateBonusFromYears(
    baseSalary: number,
    bonusPercent: number,
    years: number,
  ): number {
    return baseSalary * bonusPercent * years;
  }

  private calculateMaxSalary(baseSalary: number, salaryLimit: number): number {
    return baseSalary * salaryLimit;
  }

  private calculateBonusFromSubordinates(
    subordinateBonus: number,
    percentFromSubordinate: number,
  ): number {
    return subordinateBonus * percentFromSubordinate;
  }

  private async calculateSubordinatesBonus(
    subordinateInfo: SubordinateInfo,
    years: number,
    maxDepth: number,
  ): Promise<number> {
    const { employee, depth } = subordinateInfo;
    let subordinatesBonus = 0;

    if (depth < maxDepth && employee.subordinates.length > 0) {
      for (const subordinate of employee.subordinates) {
        const employeeTypeData = this.employeeTypeData[subordinate.type];
        let subordinateSalary = subordinate.baseSalary;

        const maxSubordinateSalary = this.calculateMaxSalary(
          subordinateSalary,
          employeeTypeData.salaryLimit,
        );

        let nextSubordinateInfo: SubordinateInfo;

        if (
          subordinate.type !== EmployeeType.Employee &&
          depth < maxDepth - 1
        ) {
          const subordinateWithSubordinates = await this.employeeRepository
            .createQueryBuilder('subordinate')
            .leftJoinAndSelect('subordinate.subordinates', 'subordinates')
            .where('subordinate.id = :id', { id: subordinate.id })
            .getOne();

          nextSubordinateInfo = {
            employee: subordinateWithSubordinates,
            depth: depth + 1,
          };

          subordinatesBonus += await this.calculateSubordinatesBonus(
            nextSubordinateInfo,
            years,
            maxDepth,
          );
        }

        subordinateSalary += this.calculateBonusFromYears(
          subordinateSalary,
          employeeTypeData.bonusPercentForYear,
          years,
        );
        subordinateSalary = Math.min(maxSubordinateSalary, subordinateSalary);
        subordinateSalary += this.calculateBonusFromSubordinates(
          employeeTypeData.bonusPercentFromSubordinates,
          subordinatesBonus,
        );

        subordinatesBonus += subordinateSalary;
      }
    }

    return subordinatesBonus;
  }

  private async calculateManagerSubordinatesBonus(
    employee: Employee,
    years: number,
    maxDepth: number,
  ): Promise<number> {
    let subordinatesBonus = 0;

    if (employee.subordinates.length > 0 && maxDepth > 0) {
      for (const subordinate of employee.subordinates) {
        const employeeTypeData = this.employeeTypeData[subordinate.type];
        let subordinateSalary = subordinate.baseSalary;

        const maxSubordinateSalary = this.calculateMaxSalary(
          subordinateSalary,
          employeeTypeData.salaryLimit,
        );

        subordinateSalary += this.calculateBonusFromYears(
          subordinate.baseSalary,
          employeeTypeData.bonusPercentForYear,
          years,
        );

        subordinateSalary = Math.min(subordinateSalary, maxSubordinateSalary);

        if (subordinate.type !== EmployeeType.Employee) {
          const subordinateWithSubordinates = await this.employeeRepository
            .createQueryBuilder('subordinate')
            .leftJoinAndSelect('subordinate.subordinates', 'subordinates')
            .where('subordinate.id = :id', { id: subordinate.id })
            .getOne();

          const subordinatesBonusForSubordinate =
            await this.calculateManagerSubordinatesBonus(
              subordinateWithSubordinates,
              years,
              maxDepth - 1,
            );

          subordinateSalary += this.calculateBonusFromSubordinates(
            subordinatesBonusForSubordinate,
            employeeTypeData.bonusPercentFromSubordinates,
          );
        }

        subordinatesBonus += subordinateSalary;
      }
    }

    return subordinatesBonus;
  }

  private calculateYearsOfWork(startDate: Date, endDate: Date): number {
    if (startDate > endDate) {
      throw new Error('startDate cannot be later than endDate.');
    }

    const diffInMilliseconds = endDate.getTime() - startDate.getTime();
    const years = diffInMilliseconds / (1000 * 60 * 60 * 24 * 365.25);
    return Math.floor(years);
  }
}
