import { NgControl } from '@angular/forms';
import { Component, HostBinding, OnInit, Optional, Self } from '@angular/core';
import { CustomControlComponent } from '../custom-control.component';
declare var $: any;

@Component({
  selector: 'custom-checkbox',
  templateUrl: './custom-checkbox.component.html'
})
export class CustomCheckboxComponent extends CustomControlComponent implements OnInit {

  checked: boolean = false;
  @HostBinding('class') class: string;

  constructor(@Self() @Optional() ngControl: NgControl) {
    super(ngControl);
  }

  override ngOnInit() {
    super.ngOnInit()
    this.class = this.size
  }

  override  writeValue(checked: boolean) {
    this.checked = checked;
  }

  onModelChange(e: boolean) {
    this.checked = e;
    this.onChange(e);
  }
}
