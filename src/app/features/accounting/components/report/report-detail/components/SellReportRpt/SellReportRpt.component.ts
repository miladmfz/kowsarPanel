import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { IDatepickerTheme, NgPersianDatepickerModule } from 'ng-persian-datepicker';
import { catchError, of } from 'rxjs';
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
  selector: 'app-SellReportRpt',
  templateUrl: './SellReportRpt.component.html',
})
export class SellReportRptComponent extends AgGridBaseComponent implements OnInit, OnDestroy {

  private readonly repo = inject(ReportWebApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly notificationService = inject(NotificationService);
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
    ObjectRef: new FormControl('0'),
    ReportCode: new FormControl(''),
    ReportTitle: new FormControl(''),

    FromDate: new FormControl(''),
    ToDate: new FormControl(''),

    ClassName: new FormControl(''),
    Department: new FormControl(''),
    WhereCluase: new FormControl(''),
    OrderBy: new FormControl(''),
    Column: new FormControl(''),

  });







  ngOnInit(): void {

    this.title = this.ReportData.ReportTitle

    this.EditForm_SearchTarget.patchValue({
      ReportCode: this.ReportData.ReportCode,
      ReportTitle: this.ReportData.ReportTitle,
      ClassName: this.ReportData.ReportForm,
    });



    this.initColumns();
    //this.loadList();
  }



  customNumberFormatter(params: any) {
    if (params.value === null || params.value === undefined) return '';
    const value = parseFloat(params.value);
    if (isNaN(value)) return params.value;

    let formatted = value.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 20
    });

    // حذف صفرهای اعشار اضافی
    if (formatted.includes('.')) {
      formatted = formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    return formatted;
  }
  private initColumns(): void {

    this.loadingservice.show()

    this.repo.GetGridSchema('T' + this.ReportData.ReportForm)
      .pipe(
        catchError((_error) => {
          this.loadingservice.hide()
          return of(null);
        })
      )
      .subscribe((data: any) => {
        if (data?.GridSchemas?.length > 0) {
          this.columnDefs1 = data.GridSchemas
            .filter((schema: any) => schema.Visible === 'True')
            .map((schema: any) => ({
              field: schema.FieldName,
              headerName: schema.Caption,
              cellClass: 'text-center',
              filter: 'agSetColumnFilter',
              sortable: true,
              resizable: true,
              minWidth: parseInt(schema.Width, 10),
              valueFormatter: schema.Separator === '1' ? this.customNumberFormatter : undefined
            }));

          // ستون عملیات
          // this.columnDefs1.unshift({
          //   field: 'عملیات',
          //   pinned: 'left',
          //   cellRenderer: CellActionFactorList,
          //   minWidth: 150,
          //   sortable: false,
          //   filter: false
          // });
        }
        this.loadingservice.hide()



        this.loadList()

      });


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
