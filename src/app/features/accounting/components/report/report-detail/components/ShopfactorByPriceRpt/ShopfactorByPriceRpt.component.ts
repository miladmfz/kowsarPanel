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
import { KowsarNumberService } from 'src/app/app-shell/framework-services/kowsar-number.service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AgGridModule,
    NgPersianDatepickerModule,
  ],
  selector: 'app-ShopfactorByPriceRpt',
  templateUrl: './ShopfactorByPriceRpt.component.html',
})
export class ShopfactorByPriceRptComponent extends AgGridBaseComponent implements OnInit, OnDestroy {

  private readonly repo = inject(ReportWebApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly notificationService = inject(NotificationService);
  private readonly loadingservice = inject(LoadingService);
  private readonly kowsarNumber = inject(KowsarNumberService);

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
        this.columnDefs1 = data.GridSchemas
          .filter((schema: any) => schema.Visible === 'True')
          .map((schema: any) => {

            // ستون عددی؟ (بر اساس Separator)
            const isNumeric =
              schema.Separator === 'True' ||
              schema.Separator === 'true' ||
              schema.Separator === '1' ||
              schema.Separator === 1 ||
              schema.Separator === true;

            const col: any = {
              field: schema.FieldName,
              headerName: schema.Caption,
              cellClass: 'text-center',
              sortable: true,
              resizable: true,
              minWidth: parseInt(schema.Width, 10),
              filter: isNumeric ? 'agNumberColumnFilter' : 'agSetColumnFilter',
            };

            if (isNumeric) {
              // ۱) نمایش عددی (۳ رقمی + فارسی) — فقط اگر واقعاً عدد باشد
              col.valueFormatter = (p: any) =>
                this.kowsarNumber.formatKowsarNumber(p.value);

              // ۲) سورت عددی واقعی، نه رشته‌ای
              col.comparator = (valueA: any, valueB: any) =>
                this.kowsarNumber.compareKowsarValues(valueA, valueB);
            }

            return col;
          });

        this.loadingservice.hide()



        //this.loadList()

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
