import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  BaseEntity,
} from 'typeorm';

@Entity()
export class Employee extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'date' })
  joinDate: Date;

  @Column({ type: 'decimal', default: 0 })
  baseSalary: number;

  @Column()
  type: string;

  @ManyToOne(() => Employee, (employee) => employee.subordinates)
  supervisor: Employee;

  @OneToMany(() => Employee, (employee) => employee.supervisor)
  subordinates: Employee[];
}
