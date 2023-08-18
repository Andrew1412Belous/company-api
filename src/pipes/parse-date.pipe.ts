import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { datePattern } from '../regexp/date-format';

@Injectable()
export class ParseDatePipe implements PipeTransform {
  transform(value: any): string {
    if (!datePattern.test(value)) {
      throw new BadRequestException('Invalid date format');
    }

    return value;
  }
}
