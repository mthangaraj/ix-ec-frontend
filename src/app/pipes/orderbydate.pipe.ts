import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'orderbydate'
})
export class OrderbydatePipe implements PipeTransform {


    transform(array: Array<string>, args: string): Array<string> {
        if (typeof args[0] === "undefined") {
            return array;
        }

        let direction = args[0][0];
        let column = args[0].slice(1);

        array.sort((a: any, b: any) => {

            let left = Number(new Date(a[column]));
            let right = Number(new Date(b[column]));

            return (direction === "-") ? right - left : left - right;
        });

        return array;
    }

}
