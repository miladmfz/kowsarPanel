import { ModalConfig } from './modal.config';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  AfterViewChecked,
} from '@angular/core';
declare var $: any;

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
})
export class ModalComponent implements AfterViewChecked {
  @Input() public modalConfig: ModalConfig;
  @Output() submited = new EventEmitter<any>();
  @Output() onModalHide = new EventEmitter();

  ngAfterViewChecked(): void {}

  open() {
    switch (this.modalConfig.size) {
      case 'large':
        this.modalConfig.size = 'modal-lg';
        break;
      case 'full':
        this.modalConfig.size = 'modal-full-width';
        break;
    }
    $(`#${this.modalConfig.id}`).modal('show');
  }

  submit(action) {
    this.submited.emit(action);
  }

  close() {
    this.onModalHide.emit();
    $(`#${this.modalConfig.id}`).modal('hide');
  }
}
