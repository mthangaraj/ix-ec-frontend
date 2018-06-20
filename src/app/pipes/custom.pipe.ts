import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'togglesign'
})
export class ToggleSignPipe implements PipeTransform {
  transform(value: any, tags: any, name: string): any {
    if (tags.includes(name)) {
      value = value * -1;
    }
    return value;
  }
}
