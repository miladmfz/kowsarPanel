import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-app-shared-data',
  templateUrl: './app-shared-data.component.html',
  standalone: false
})
export class AppSharedDataComponent implements OnInit {
  currentDateYm;
  currentCompanyGuid;
  SomeGlobalSetting;

  constructor() { }

  ngOnInit() { }

  getFormValue(form: FormGroup, controlName: string): unknown {
    return form.get(controlName)?.value;
  }

  setFormValue(form: FormGroup, controlName: string, value: unknown): void {
    form.get(controlName)?.setValue(value);
  }

  disableFormControl(form: FormGroup, controlName: string): void {
    form.get(controlName)?.disable();
  }

  enableFormControl(form: FormGroup, controlName: string): void {
    form.get(controlName)?.enable();
  }

  hideElement(selector: string): void {
    document.querySelector<HTMLElement>(selector)?.classList.add('d-none');
  }

  showElement(selector: string): void {
    document.querySelector<HTMLElement>(selector)?.classList.remove('d-none');
  }

}
