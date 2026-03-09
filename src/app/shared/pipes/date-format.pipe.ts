import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'dateFormat', standalone: true })
export class DateFormatPipe implements PipeTransform {
  transform(value: string | Date | null | undefined, format: 'short' | 'long' = 'short'): string {
    if (value == null) return '';
    const date = typeof value === 'string' ? new Date(value) : value;
    if (isNaN(date.getTime())) return '';
    return format === 'long'
      ? date.toLocaleDateString('uk-UA', { dateStyle: 'long' })
      : date.toLocaleDateString('uk-UA', { dateStyle: 'short' });
  }
}
