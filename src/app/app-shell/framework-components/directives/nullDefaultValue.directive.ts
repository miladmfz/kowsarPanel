import { NgControl } from "@angular/forms";
import { Directive, ElementRef, HostListener } from "@angular/core";

@Directive({
  selector: '[nullValue]'
})
export class NullDefaultValueDirective {

  constructor(private el: ElementRef, private control: NgControl) { }

  @HostListener('change', ['$event.target.value'])
  onEvent(value) {
    this.control.control.setValue((value === '') ? null : value);
  }

}
