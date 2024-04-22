import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { NotificationService } from 'src/app/app-shell/framework-services/notification.service';
import { operationSuccessful } from 'src/app/app-shell/framework-components/app-messages';

import { IncidentItemService } from '../../services/incident-item.service';
import { LookupItem } from '../../../incident/lookup-type';
declare var $: any;

@Component({
  selector: 'app-incident-item-ops',
  templateUrl: './incident-item-ops.component.html',
})
export class IncidentItemOpsComponent implements OnInit {
  title = '';
  incidentItemId: string = '';


  lookupItem: LookupItem[] = []

  opsForm = new FormGroup({
    id: new FormControl(),
    incidentItemName: new FormControl('', Validators.required),
    IncidentItemParentId: new FormControl(),
  });

  constructor(
    private readonly incidentItemService: IncidentItemService,
    private readonly route: ActivatedRoute,
    private readonly notificationService: NotificationService,
    private readonly router: Router
  ) { }

  ngOnInit() {
    //debugger
    this.route.paramMap.subscribe((params: ParamMap) => {
      var id = params.get('id');
      if (id != null) {
        this.incidentItemId = id;
        this.getDetails();
        this.title = 'ویرایش';
      } else {
        this.title = 'جدید';
      }
    });
  }

  getDetails() {
    //debugger
    this.incidentItemService.getBy(this.incidentItemId).subscribe((data) => {
      //debugger
      this.opsForm.patchValue(data);
      //$('select').trigger('change');
    });
  }

  onBtnCancelClick() {
    this.router.navigateByUrl('base-info/incident-item/list');
  }

  submit(action) {
    //debugger
    this.opsForm.markAllAsTouched();
    if (!this.opsForm.valid) return;
    const command = this.opsForm.value;
    if (action == 'delete') {
      this.incidentItemService.delete(command.id).subscribe((id) => {
        this.handleCreateEditOps(action, id);
      });
    }
    if (this.incidentItemId == '') {
      this.incidentItemService.create(command).subscribe((id) => {
        this.handleCreateEditOps(action, id);
      });
    } else {
      command.id = this.incidentItemId;
      this.incidentItemService.edit(command).subscribe(() => {
        this.handleCreateEditOps(action, this.incidentItemId);
        this.incidentItemId = '';
      });
    }
  }

  handleCreateEditOps(action, id) {
    if (action == 'new') {
      this.opsForm.reset();
      this.incidentItemId = '';
      this.router.navigateByUrl('/base-info/incident-item/create');
    } else if (action == 'exit') {
      this.router.navigateByUrl('/base-info/incident-item/list');
    } else {
      this.router.navigateByUrl(`/base-info/incident-item/edit/${id}`);
    }

    this.notificationService.succeded(operationSuccessful);
  }
}
