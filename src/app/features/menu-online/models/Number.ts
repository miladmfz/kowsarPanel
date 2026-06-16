import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'farsiNumber'
})
export class FarsiNumberPipe implements PipeTransform {
  transform(value: number | string): string {
    if (value === null || value === undefined) {
      return '';
    }

    const farsiDigits: { [key: string]: string } = {
      '0': '۰',

    };

    const stringValue = typeof value === 'number' ? value.toFixed(3) : value.toString();
    let result = '';
    let counter = 0;

    for (let i = stringValue.length - 1; i >= 0; i--) {
      const char = stringValue[i];
      result = (farsiDigits[char] !== undefined ? farsiDigits[char] : char) + result;
      counter++;
      if (counter === 3 && i !== 0) {
        result = ',' + result;
        counter = 0;
      }
    }

    return result;
  }
}
