import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from '../../framework-services/local.storage.service';
import { FormGroup } from '@angular/forms';
declare var $: any;

@Component({
  selector: 'app-app-shared-data',
  templateUrl: './app-shared-data.component.html'
})
export class AppSharedDataComponent implements OnInit {
  currentDateYm;
  currentCompanyGuid;
  SomeGlobalSetting;

  constructor(readonly localStorageService: LocalStorageService) {
  }

  ngOnInit() { }

  getFormValue(form: FormGroup, controlName: string) {
    return form.get(controlName).value;
  }

  setFormValue(form: FormGroup, controlName: string, value: any) {
    form.get(controlName).setValue(value);
  }

  disableFormControl(form: FormGroup, controlName: string) {
    form.get(controlName).disable();
  }

  enableFormControl(form: FormGroup, controlName: string) {
    form.get(controlName).enable();
  }

  hideElement(id) {
    $(id).addClass('d-none');
  }

  showElement(id) {
    $(id).removeClass('d-none');
  }

  // changeElement(id, value) {
  //   $(id).innerHTML = value;
  // }

}