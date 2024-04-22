import { Directive, EventEmitter, ElementRef, AfterViewInit, Output, OnChanges, SimpleChanges, Input, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
declare var $: any;

@Directive({
    selector: '[appHourMask]',
    providers: []
})
export class HourMaskDirective implements OnChanges {
    @Output()
    value = new EventEmitter<boolean>();

    @Input() input;
    constructor(private el: ElementRef, private control: NgControl,
        private ref: ChangeDetectorRef) {
    }

    @HostListener('focusout', ['$event.target.value'])
    onMouseEnter(value) {
        let result = '';
        for (let i = 0; i < 6; i++) {
            if (i == 3) {
                result += ":";
                continue;
            }
            if (value[i])
                result += value[i];
            else
                result += '0';
        }

        this.control.control.setValue(result);
    }

    ngOnChanges(changes): void {
        const input = changes.input;

        if (input.firstChange)
            return;

        let result = '';
        let currentValue = input.currentValue.replace(":", "");
        if (currentValue.length == 6) {
            result = input.previousValue;
        } else {
            for (let i = 0; i < currentValue.length; i++) {
                if (i == 3) {
                    result += ":";
                }
                if (currentValue[i])
                    result += currentValue[i];
                else
                    result += '0';
            }
        }

        if (result.length == 6) {
            const minutes = result.substring(result.length - 2);
            if (parseInt(minutes) > 59) {
                result = result.slice(0, -2);
                result += "59";
            }
        }

        this.control.control.setValue(result);
        this.ref.detectChanges();
    }
}