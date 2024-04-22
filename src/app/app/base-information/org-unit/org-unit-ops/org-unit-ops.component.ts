import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OrgUnitService } from '../../services/org-unit.service';
import { NotificationService } from 'src/app/app-shell/framework-services/notification.service';
import { operationSuccessful } from 'src/app/app-shell/framework-components/app-messages';
import { LookupItem } from '../orgcombo';
declare var $: any;

@Component({
  selector: 'app-org-unit-ops',
  templateUrl: './org-unit-ops.component.html',
})
export class OrgUnitOpsComponent implements OnInit {
  title = 'ایجاد سازمان ';
  incidentId: string = '';

  OrgOpsFrm = new FormGroup({
    id: new FormControl(),
    name: new FormControl('', Validators.required),
    parentId: new FormControl(null)




  });

  constructor(
    private readonly OrgUnitService: OrgUnitService,
    private readonly route: ActivatedRoute,
    private readonly notificationService: NotificationService,
    private readonly router: Router
  ) { }
  lookupItem: LookupItem[] = []
  ngOnInit() {
    //debugger
    this.route.paramMap.subscribe((params: ParamMap) => {
      var id = params.get('id');
      if (id != null) {
        this.incidentId = id;
        this.getDetails();
        this.title = 'ویرایش';
      } else {
        this.title = 'جدید';
      }
    });



    this.OrgUnitService
      .getForCombo<LookupItem[]>()
      .subscribe(data => this.lookupItem = data)
    console.log(this.lookupItem)
  }


  getDetails() {
    //debugger
    this.OrgUnitService.getBy(this.incidentId).subscribe((data) => {
      debugger
      this.OrgOpsFrm.patchValue(data);
      //$('select').trigger('change');
    });




  }

  onBtnCancelClick() {
    this.router.navigateByUrl('base-info/org-unit/list');
  }


  submit(action) {
    debugger
    this.OrgOpsFrm.markAllAsTouched();
    if (!this.OrgOpsFrm.valid) return;
    const command = this.OrgOpsFrm.value;
    if (action == 'delete') {
      this.OrgUnitService.delete(command.id).subscribe((id) => {
        this.handleCreateEditOps(action, id);
      });
    }
    if (this.incidentId == '') {
      this.OrgUnitService.create(command).subscribe((id) => {
        this.handleCreateEditOps(action, id);
      });
    } else {
      command.id = this.incidentId;
      this.OrgUnitService.edit(command).subscribe(() => {
        this.handleCreateEditOps(action, this.incidentId);
        this.incidentId = '';
      });
    }
  }

  handleCreateEditOps(action, id) {
    if (action == 'new') {
      this.OrgOpsFrm.reset();
      this.incidentId = '';
      this.router.navigateByUrl('/base-info/org-unit/create');
    } else if (action == 'exit') {
      this.router.navigateByUrl('/base-info/org-unit/list');
    } else {
      this.router.navigateByUrl(`/base-info/org-unit/edit/${id}`);
    }

    this.notificationService.succeded(operationSuccessful);
  }
}
