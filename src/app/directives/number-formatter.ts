import { Directive, HostListener, ElementRef, OnInit } from "@angular/core";
import { NumberFormatPipe } from "../pipes/numbers.pipe";

@Directive({ selector: "[NumberFormatter]" })
export class NumberFormatterDirective implements OnInit {

    private el: HTMLInputElement;
    private DECIMAL_SEPARATOR: string;
    private THOUSANDS_SEPARATOR: string;

    constructor(
        private elementRef: ElementRef,
        private formatter: NumberFormatPipe
    ) {
        this.el = this.elementRef.nativeElement;
        this.DECIMAL_SEPARATOR = ".";
        this.THOUSANDS_SEPARATOR = ",";
    }

    ngOnInit() {
        this.el.value = this.formatter.transform(this.el.value);
    }

    @HostListener("focus", ["$event.target.value"])
    onFocus(value) {
        if (this.formatter.parse(value) == '0'){
            value = null;
        }
        this.el.value = this.formatter.parse(value); // opossite of transform
    }

    @HostListener("blur", ["$event.target.value"])
    onBlur(value) {
        this.el.value = this.formatter.transform(value);
    }

    // Allow decimal numbers. The \. is only allowed once to occur
    private regex: RegExp = new RegExp(/^-?([0-9]\d*)+(\.\d+)?$/g);
    //private regex: RegExp = new RegExp(/^(\-?)([0-9]*)$/g);

    // Allow key codes for special events. Reflect :
    // Backspace, tab, end, home, -, .
    private specialKeys: Array<string> = [ 'Backspace', 'Tab', 'End', 'Home','-','Delete','.','ArrowLeft','ArrowRight' ];
    negativeSignCount = 1;
    dotSignCount = 1;
    caretPos = 0;

    @HostListener('keydown', [ '$event' ])
    onKeyDown(event: KeyboardEvent) {
        let keyList = {}

        let value = this.elementRef.nativeElement.value;



        let current: string = value;
        var dotPos = value.indexOf(this.DECIMAL_SEPARATOR);
        var caratPos = this.getSelectionStart(this.el);

        // We need this because the current value on the DOM element
        // is not yet updated with the value from this event
        let next: string = current.concat(event.key);

        let [ integer, fraction = "" ] = (value || "").split(this.DECIMAL_SEPARATOR);

        if ([46, 8, 9, 27, 13, 109, 110, 190].indexOf(event.keyCode) !== -1 ||
            // Allow: Ctrl+A
            (event.keyCode === 65 && (event.ctrlKey || event.metaKey)) ||
            // Allow: Ctrl+C
            (event.keyCode === 67 && (event.ctrlKey || event.metaKey)) ||
            // Allow: Ctrl+V
            (event.keyCode === 86 && (event.ctrlKey || event.metaKey)) ||
            // Allow: Ctrl+X
            (event.keyCode === 88 && (event.ctrlKey || event.metaKey)) ||
            // Allow: home, end, left, right
            (event.keyCode >= 35 && event.keyCode <= 39)) {
            // let it happen, don't do anything
            return;
        }

        // Ensure that it is a number and stop the keypress
        if ((event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)) && (event.keyCode < 96 || event.keyCode > 105)) {
            event.preventDefault();
        }

        if((caratPos > dotPos && dotPos>-1 && (fraction.length > 1)) || !String(next).match(this.regex)){
            return false;
        }

        return true;

    }

    getSelectionStart(o) {
        if (o.createTextRange) {
            return o.value.lastIndexOf(this.elementRef.nativeElement.value)
        } else return o.selectionStart
    }



}

@Directive({ selector: "[NumbersOnly]" })
export class NumbersOnlyDirective implements OnInit {

    private el: HTMLInputElement;
    private DECIMAL_SEPARATOR: string;
    private THOUSANDS_SEPARATOR: string;

    constructor(
        private elementRef: ElementRef,
        private formatter: NumberFormatPipe
    ) {
        this.el = this.elementRef.nativeElement;
        this.DECIMAL_SEPARATOR = ".";
        this.THOUSANDS_SEPARATOR = ",";
    }

    ngOnInit() {
        this.el.value = this.formatter.transform(this.el.value);
    }

    // Allow decimal numbers. The \. is only allowed once to occur
    private regex: RegExp = new RegExp(/^([0-9]\d*)$/g);
    //private regex: RegExp = new RegExp(/^(\-?)([0-9]*)$/g);

    // Allow key codes for special events. Reflect :
    // Backspace, tab, end, home, -, .
    private specialKeys: Array<string> = [ 'Backspace', 'Tab', 'End', 'Home','-','Delete','.','ArrowLeft','ArrowRight' ];
    negativeSignCount = 1;
    dotSignCount = 1;
    caretPos = 0;

    @HostListener('keydown', [ '$event' ])
    onKeyDown(event: KeyboardEvent) {
        let keyList = {}

        let value = this.elementRef.nativeElement.value;

        let current: string = value;
        //var dotPos = value.indexOf(this.DECIMAL_SEPARATOR);
        var caratPos = this.getSelectionStart(this.el);

        // We need this because the current value on the DOM element
        // is not yet updated with the value from this event
        let next: string = current.concat(event.key);

        let [ integer, fraction = "" ] = (value || "").split(this.DECIMAL_SEPARATOR);

        if ([46, 8, 9, 27, 109, 110, 190].indexOf(event.keyCode) !== -1 ||
            // Allow: Ctrl+A
            (event.keyCode === 65 && (event.ctrlKey || event.metaKey)) ||
            // Allow: Ctrl+C
            (event.keyCode === 67 && (event.ctrlKey || event.metaKey)) ||
            // Allow: Ctrl+V
            (event.keyCode === 86 && (event.ctrlKey || event.metaKey)) ||
            // Allow: Ctrl+X
            (event.keyCode === 88 && (event.ctrlKey || event.metaKey)) ||
            // Allow: home, end, left, right
            (event.keyCode >= 35 && event.keyCode <= 39)) {
            // let it happen, don't do anything
            return;
        }

        // Ensure that it is a number and stop the keypress
        if ((event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)) && (event.keyCode < 96 || event.keyCode > 105)) {
            event.preventDefault();
        }

        if(((fraction.length > 1)) || !String(next).match(this.regex)){
            return false;
        }

        return true;

    }

    getSelectionStart(o) {
        if (o.createTextRange) {
            return o.value.lastIndexOf(this.elementRef.nativeElement.value)
        } else return o.selectionStart
    }



}

