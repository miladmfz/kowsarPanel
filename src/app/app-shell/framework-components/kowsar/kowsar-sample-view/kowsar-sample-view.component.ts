import { Component, inject, OnDestroy, OnInit, Renderer2, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router, RouterModule } from '@angular/router';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { DbSetupWebApiService } from 'src/app/features/accounting/services/TanzimatWebApi/DbSetupWebApi.service';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { Subject } from 'rxjs';
import { KowsarBaseWebApi } from 'src/app/app-shell/framework-services/base/KowsarBaseWebApi.service';

@Component({
  selector: 'app-kowsar-sample-view',
  templateUrl: './kowsar-sample-view.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AgGridAngular,
    RouterModule
  ],
})
export class KowsarSampleViewComponent extends AgGridBaseComponent
  implements OnInit, OnDestroy {

  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  private readonly repo = inject(KowsarBaseWebApi);
  private readonly renderer = inject(Renderer2);
  private readonly route = inject(ActivatedRoute);


  constructor() {
    super();
  }


  title = signal('TGood')
  ClassName = signal('TGood')
  records = signal<any[]>([])
  dateValue = new FormControl();

  Searchtarget = signal('')

  EditForm_Search = new FormGroup({
    SearchTarget: new FormControl(''),
  });

  private searchSubject = new Subject<string>();

  EditForm_FiscalPeriod = new FormGroup({
    PeriodId: new FormControl(''),
    comment: new FormControl(''),
    FromDate: new FormControl(''),
    ToDate: new FormControl(''),
    State: new FormControl(''),
  });





  onSearchChange() {
    const value = this.EditForm_Search.get('SearchTarget')?.value ?? '';
    this.searchSubject.next(value);
  }

  AddNew() {
    this.notificationService.develop()
  }

  ngOnInit(): void {


    this.themeSub = this.themeService.theme$.subscribe(mode => {
      this.isDarkMode = mode === 'dark';
    });


    this.route.paramMap.subscribe((params: ParamMap) => {
      var idtemp = params.get('id');
      var idtemp_str = params.get('id_str');
      if (idtemp != null) {

        this.title.set(idtemp_str);
        this.ClassName.set(idtemp);

        this.getGridSchema();
      } else {

        this.title.set("TGood");
        this.ClassName.set("TGood");
        this.getGridSchema();
      }
    });





    this.GetData();
  }


  getGridSchema() {


    this.repo.GetGridSchemaVisible("T" + this.ClassName())
      .subscribe((data: any) => {

        if (data && data.GridSchemas && data.GridSchemas.length > 0) {
          this.column_name_1 = data.GridSchemas.filter(schema => schema.Visible === "True").map(schema => ({
            field: schema.FieldName,
            headerName: schema.Caption,
            cellClass: 'text-center',
            sortable: true,
            resizable: true,
            minWidth: parseInt(schema.Width) + 100,
            valueFormatter: schema.Separator === '1' ? this.customNumberFormatter : undefined
          }));

          // this.column_name_1.unshift({
          //   field: 'عملیات',
          //   pinned: 'left',
          //   cellRenderer: CellActionPeriodList,

          //   minWidth: 100,
          //   sortable: false,
          //   filter: false,
          //   // resizable: false
          // });
        }
        //this.GetGood()

      });
  }


  override onGridReady(params: any, index: number) {
    super.onGridReady(params, index);

    // ذخیره API درست
    if (index >= 1 && index <= 6) {
      (this as any)[`gridApi${index}`] = params.api;
    }

    // فیت کردن ستون‌ها با تأخیر کوتاه
    setTimeout(() => {
      try {
        if (params.api && !params.api.isDestroyed?.()) {
          params.api.sizeColumnsToFit();
        }
      } catch { }
    }, 50);
  }


  GetData() {
    this.notificationService.develop()


    // this.repo.GetFiscalPeriod(this.EditForm_Search.value)
    //   .subscribe((data: any) => {

    //     this.records.set(data.FiscalPeriods)
    //     this.updateGridData(1, this.records());

    //   });
  }









}
