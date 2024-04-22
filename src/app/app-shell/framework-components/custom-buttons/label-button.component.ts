import {
  Component, EventEmitter,
  Input,
  OnInit, Output
} from '@angular/core';
import { BaseButtonComponent } from './base-button.component';

@Component({
  selector: 'app-label-button',
  template: `
    <button [id]="identifier" [type]="btnType" className="btn btn-{{className}} waves-effect waves-light" (click)="onClick()" [disabled]="disable">
      {{label}}
    </button>
  `
})
export class LabelButtonComponent extends BaseButtonComponent implements OnInit {
  @Input() label = 'Button'
}
