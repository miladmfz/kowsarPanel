import { Component, inject, OnDestroy, OnInit, Renderer2, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { KowsarBaseWebApi } from 'src/app/app-shell/framework-services/base/KowsarBaseWebApi.service';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { debounceTime, Subject } from 'rxjs';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { DbSetupWebApiService } from 'src/app/features/accounting/services/TanzimatWebApi/DbSetupWebApi.service';
import { FiscalPeriodWebApiService } from 'src/app/features/accounting/services/TanzimatWebApi/FiscalPeriodWebApi.service';
import { CellActionFiscalPeriodList } from './cell-action-fiscalperiod-list';
import { AgGridMemoryService } from 'src/app/app-shell/framework-components/ag-grid/services/ag-grid-memory.service';
@Component({
  selector: 'app-fiscal-period-list',
  templateUrl: './fiscal-period-list.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AgGridAngular,
    RouterModule
  ],
})
export class FiscalPeriodListComponent extends AgGridBaseComponent
  implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  private readonly repo = inject(FiscalPeriodWebApiService);
  private readonly base_repo = inject(KowsarBaseWebApi);

  private readonly renderer = inject(Renderer2);
  private readonly gridMemory_service = inject(AgGridMemoryService);

  constructor() {
    super();
  }


  title = signal('مدیریت دوره مالی')
  records = signal<any[]>([])

  gridMemory1 = new Map<string, any>();
  gridKey = signal('');
  dateValue = new FormControl();

  private searchSubject = new Subject<string>();

  EditForm_Search = new FormGroup({
    SearchTarget: new FormControl(''),
  });





  EditForm_FiscalPeriod = new FormGroup({
    PeriodId: new FormControl(''),
    comment: new FormControl(''),
    FromDate: new FormControl(''),
    ToDate: new FormControl(''),
    State: new FormControl(''),
  });


  ngOnInit(): void {

    this.themeSub = this.themeService.theme$.subscribe(mode => {
      this.isDarkMode = mode === 'dark';
    });

    this.getGridSchema();

    this.EditForm_Search.get("SearchTarget")?.valueChanges
      .pipe(debounceTime(400))
      .subscribe(x => this.GetData());
  }

  onSearchChange() {
    const value = this.EditForm_Search.get('SearchTarget')?.value ?? '';
    this.searchSubject.next(value);
  }

  AddNew() {
    this.notificationService.develop()
  }



  getGridSchema() {


    this.base_repo.GetGridSchemaVisible('TFiscalPeriod')
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

          this.column_name_1.unshift({
            field: 'عملیات',
            pinned: 'left',
            cellRenderer: CellActionFiscalPeriodList,

            minWidth: 100,
            sortable: false,
            filter: false,
            // resizable: false
          });
        }
        this.GetData()
      });
  }


  override onGridReady(params: any, index: number) {
    super.onGridReady(params, index);

    if (index >= 1 && index <= 6) {
      (this as any)[`gridApi${index}`] = params.api;
    }

    setTimeout(() => {
      if (params.api && !params.api.isDestroyed?.()) {
        params.api.sizeColumnsToFit();
      }
    }, 50);
  }




  ShowModal(data: any) {

    this.notificationService.develop()
    // this.EditForm_FiscalPeriod.patchValue({
    //   PeriodId: data.PeriodId,
    //   comment: data.comment,
    //   FromDate: data.FromDate,
    //   ToDate: data.ToDate,
    //   State: data.State,
    // });

    // this.fiscalperiod_Modal_Response_show()

  }


  GetData() {



    this.repo.GetFiscalPeriod(this.EditForm_Search.value)
      .subscribe((data: any) => {

        this.records.set(data.FiscalPeriods)
        this.updateGridData(1, this.records());

      });
  }






  UpdateFiscalPeriod() {



    this.repo.UpdateFiscalPeriod(this.EditForm_FiscalPeriod.value)
      .subscribe((data: any) => {

        this.fiscalperiod_Modal_Response_close()
        this.GetData()

      });
  }





  fiscalperiod_Modal_Response_show() {
    const modal = this.renderer.selectRootElement('#fiscalperiod', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }
  fiscalperiod_Modal_Response_close() {
    const modal = this.renderer.selectRootElement('#fiscalperiod', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }


}
