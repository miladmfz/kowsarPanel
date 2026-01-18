import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { IDatepickerTheme, NgPersianDatepickerModule } from 'ng-persian-datepicker';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { ReportWebApiService } from 'src/app/features/accounting/services/ReportWebApi.service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AgGridModule,
    NgPersianDatepickerModule,
  ],
  selector: 'app-CustomerFactorEtebarRpt',
  templateUrl: './CustomerFactorEtebarRpt.component.html',
})
export class CustomerFactorEtebarRptComponent extends AgGridBaseComponent implements OnInit, OnDestroy {

  private readonly repo = inject(ReportWebApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly notify = inject(NotificationService);
  private readonly loadingservice = inject(LoadingService);

  constructor() {
    super();
  }

  @Input() ReportData: any;

  records: any[] = [];
  modal_title = '';
  title = 'Sample title';

  ReportCode: string = '';

  customTheme: Partial<IDatepickerTheme> = {
    selectedBackground: '#0066cc',
    selectedText: '#ffffff',
  };


  EditForm_SearchTarget = new FormGroup({
    SearchTarget: new FormControl(''),
    CentralRef: new FormControl(''),
    StartTime: new FormControl(''),
    EndTime: new FormControl(''),
    ObjectRef: new FormControl('0'),
  });






  ngOnInit(): void {

    this.title = this.ReportData.ReportTitle


    //this.initColumns();
    //this.loadList();
  }




  private initColumns(): void {
    this.columnDefs1 = [

      {
        field: 'TiTle',
        headerName: 'TiTle',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150,
      },

    ];



  }






  override onGridReady(params: any, index: number) {
    super.onGridReady(params, index);

    if (index >= 1 && index <= 6) {
      (this as any)[`gridApi${index}`] = params.api;
    }
    setTimeout(() => {
      try {
        if (params.api && !params.api.isDestroyed?.()) {
          params.api.sizeColumnsToFit();
        }
      } catch { }
    }, 50);
  }



  loadList(): void {




  }

  clearFilter(): void {

    // this.EditForm_SearchTarget.patchValue({
    //   SearchTarget: "",
    //   CentralRef: "",
    //   CreationDate: "",
    //   OwnCentralRef: "",
    //   PersonInfoCode: "",
    //   OwnerPersonInfoRef: "",
    //   StartTime: "",
    //   EndTime: "",
    //   SelectedOption: "0",
    // });
    // this.loadList()
  }




}
