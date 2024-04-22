import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { datePickerConfig } from '../constants'

@Component({
  selector: 'app-select-date',
  templateUrl: './select-date.component.html'
})
export class SelectDateComponent implements OnInit {

  fromDate
  toDate
  datePickerConfig = datePickerConfig

  @Input() id
  @Input() type
  @Output() submited: EventEmitter<any> = new EventEmitter()

  constructor() { }

  ngOnInit() {
  }

  submit() {
    this.submited.emit({ fromDate: this.fromDate, toDate: this.toDate })
  }
}
