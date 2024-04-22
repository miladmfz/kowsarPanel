import { NgControl } from '@angular/forms';
import { AfterViewChecked, Component, EventEmitter, HostBinding, Input, OnInit, Optional, Output, Self } from '@angular/core';
import { CustomControlComponent } from '../custom-control.component';
import { SettingService } from 'src/app/app-shell/framework-services/setting.service';
declare var $: any;

@Component({
  selector: 'custom-select',
  templateUrl: './custom-select.component.html'
})
export class CustomSelectComponent extends CustomControlComponent implements OnInit, AfterViewChecked {

  minumumInputLength = this.settingService.getSettingValue("MinimumInputLength")

  @HostBinding('class') class: string
  @Input() type: 'select' | 'select-ajax' = 'select'
  @Input() options: any[] = []
  @Input() ajaxUrl: string
  @Input() searchTerm: string
  @Input() selectedItem: { id: string, name: string }

  @Output() selected = new EventEmitter()

  constructor(
    private readonly settingService: SettingService,
    @Self() @Optional() ngControl: NgControl) {
    super(ngControl)
  }

  override ngOnInit() {
    super.ngOnInit()
    this.class = this.size
  }

  ngAfterViewChecked(): void {
    $('select').trigger('change')
  }

  itemSeleceted() {
    this.selected.emit()
  }
}
