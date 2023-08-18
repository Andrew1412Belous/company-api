import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmployeeModule } from './employee/employee.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayrollModule } from './payroll/payroll.module';
import { ConfigModule } from '@nestjs/config';

import * as dbConfig from '../ormconfig';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    TypeOrmModule.forRoot(dbConfig),
    // TypeOrmModule.forRoot({
    //   type: 'sqlite',
    //   database: 'database.sqlite',
    //   entities: [__dirname + '/**/*.entity{.ts,.js}'],
    //   synchronize: true,
    // }),
    EmployeeModule,
    PayrollModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
