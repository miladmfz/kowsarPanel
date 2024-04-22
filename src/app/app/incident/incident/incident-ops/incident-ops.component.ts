import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { NotificationService } from 'src/app/app-shell/framework-services/notification.service';
import { operationSuccessful } from 'src/app/app-shell/framework-components/app-messages';

import { IncidentService } from '../../services/incident.service';
import { LookupItem } from '../../lookup-type';
declare var $: any;

@Component({
  selector: 'app-incident-ops',
  templateUrl: './incident-ops.component.html',
})
export class IncidentItemOpsComponent implements OnInit {
  title = 'ایجاد نوع داده انتخابی';
  incidentId: string = '';
  opsForm = new FormGroup({
    id: new FormControl(''),
    BaseNewsId: new FormControl('', Validators.required),
    OrgUnitId: new FormControl('', Validators.required),
    IncidentTypeId: new FormControl('', Validators.required),
    Location: new FormControl('', Validators.required),
    EquipmentId: new FormControl('', Validators.required),
    EquipmentDesc: new FormControl('', Validators.required),
    HurtCount: new FormControl('', Validators.required),
    DeadCount: new FormControl('', Validators.required),
  });

  lookupItem: LookupItem[] = []

  constructor(
    private readonly incidentService: IncidentService,
    private readonly route: ActivatedRoute,
    private readonly notificationService: NotificationService,
    private readonly router: Router
  ) { }

  ngOnInit() {
    //debugger
    this.route.paramMap.subscribe((params: ParamMap) => {
      var id = params.get('id');
      if (id != null) {
        this.incidentId = id;
        this.getDetails();
      }
    });
    //debugger
    this.incidentService
      .incidentItemCombo<LookupItem[]>('B3236872-DA31-4605-B2A2-88745E478074')
      .subscribe(data => this.lookupItem = data)
    console.log(this.lookupItem)
  }

  getDetails() {
    //debugger
    this.incidentService.getBy(this.incidentId).subscribe((data) => {
      debugger
      this.opsForm.patchValue(data);
      //$('select').trigger('change');
    });
  }

  onBtnCancelClick() {
    this.router.navigateByUrl('incident/incident/list');
  }

  submit(action) {
    debugger
    const command = this.opsForm.value;
    if (action == 'delete') {
      this.incidentService.delete(command.id).subscribe((id) => {
        this.handleCreateEditOps(action, id);
      });
    }
    if (command.id == '') {
      debugger
      this.incidentService.create(command).subscribe((id) => {
        this.handleCreateEditOps(action, id);
      });
    } else {
      //command.id = this.incidentId;
      this.incidentService.edit(command).subscribe(() => {
        this.handleCreateEditOps(action, this.incidentId);
        this.incidentId = '';
      });
    }
  }

  handleCreateEditOps(action, id) {
    //debugger
    //if (action == 'new') {
    this.opsForm.reset();
    //this.title = 'ایجاد کاربر جدید';
    this.incidentId = '';
    document.getElementById('IncidentItemName').focus();
    //} else if (action == 'exit') {
    //  this.router.navigateByUrl('/user-management/user/list');
    //} else {
    //  this.title = 'ویرایش کاربر';
    //  this.router.navigateByUrl(`/user-management/user/edit/${id}`);
    //}

    this.notificationService.succeded(operationSuccessful);
  }
}
