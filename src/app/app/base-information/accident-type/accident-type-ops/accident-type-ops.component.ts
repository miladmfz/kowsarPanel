import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AccidentTypeService } from '../../services/accident-type.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { NotificationService } from 'src/app/app-shell/framework-services/notification.service';
import { operationSuccessful } from 'src/app/app-shell/framework-components/app-messages';
declare var $: any;

@Component({
  selector: 'app-accident-type-ops',
  templateUrl: './accident-type-ops.component.html',
})
export class AccidentTypeOpsComponent implements OnInit {
  title = 'ایجاد نوع حادثه';
  accidentId: number = 0;

  accidentOpsFrm = new FormGroup({
    id: new FormControl(),
    itemTitle: new FormControl('', Validators.required),
  });

  constructor(
    private readonly accidentTypeService: AccidentTypeService,
    private readonly route: ActivatedRoute,
    private readonly notificationService: NotificationService,
    private readonly router: Router
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params: ParamMap) => {
      var id = params.get('id');
      if (id != null) {
        this.accidentId = parseInt(id);
        this.getAccidentDetails();
      }
    });
    console.log(this.accidentOpsFrm.controls);
  }

  getAccidentDetails() {
    this.accidentTypeService.getBy(this.accidentId).subscribe((data) => {
      this.accidentOpsFrm.patchValue(data);
      $('select').trigger('change');
    });
  }

  onBtnCancelClick() {
    this.router.navigateByUrl('/base-info/accident-type/list');
  }

  submit(action) {
    this.accidentOpsFrm.markAllAsTouched();
    if (!this.accidentOpsFrm.valid) return;
    const command = this.accidentOpsFrm.value;
    if (this.accidentId == 0) {
      this.accidentTypeService.create(command).subscribe((id) => {
        this.handleCreateEditOps(action, id);
      });
    } else {
      command.id = this.accidentId;
      this.accidentTypeService.edit(command).subscribe(() => {
        this.handleCreateEditOps(action, this.accidentId);
        this.accidentId = 0;
      });
    }
  }

  handleCreateEditOps(action, id) {
    if (action == 'new') {
      this.accidentOpsFrm.reset();
      this.title = 'ایجاد کاربر جدید';
      this.accidentId = 0;
      document.getElementById('code').focus();
    } else if (action == 'exit') {
      this.router.navigateByUrl('/accident-management/accident/list');
    } else {
      this.title = 'ویرایش کاربر';
      this.router.navigateByUrl(`/accident-management/accident/edit/${id}`);
    }

    this.notificationService.succeded(operationSuccessful);
  }
}
