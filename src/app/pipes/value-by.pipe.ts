import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'valueBy'
})
export class ValueByPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return null;
  }

}
