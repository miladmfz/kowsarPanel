import { Component, OnInit, OnDestroy, inject, signal, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { InternalAppsWebApiService } from '../../../services/InternalAppsWebApi.service';
import { CellActionPatternList } from './cell_action_pattern_list';
import { TaskWebApiService } from '../../../services/TaskWebApi.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { CellActionPatternGoodList } from './cell_action_patterngood_list';
import { debounceTime, Subject } from 'rxjs';
import { SupportFactorWebApiService } from '../../../services/SupportFactorWebApi.service';
import { CellActionGoodListList } from './cell_action_goodlist_list';

@Component({
  selector: 'app-internal-pattern-list',
  templateUrl: './internal-pattern-list.component.html',
  standalone: true,

  // مهم‌ترین بخش!
  imports: [
    CommonModule,
    AgGridModule,
    RouterModule,
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

  ],
})
export class InternalPatternListComponent extends AgGridBaseComponent
  implements OnInit, OnDestroy {

  records = signal<any[]>([])
  records_patternGoods = signal<any[]>([])
  records_goods = signal<any[]>([])
  title = signal('لیست الگو های کالایی')

  modal_PatternGood_title = signal('لیست اقلام الگو')
  modal_Pattern_title = signal('الگو')
  PatternCode_Selected = signal("0")
  loading = signal(false)

  private readonly router = inject(Router);
  private readonly renderer = inject(Renderer2);
  private readonly Good_repo = inject(SupportFactorWebApiService);

  private readonly repo = inject(TaskWebApiService);
  private readonly notificationService = inject(NotificationService);



  EditForm_Pattern = new FormGroup({
    PatternCode: new FormControl('0'),
    Title: new FormControl('', Validators.required),
    Explain: new FormControl(''),
  });

  EditForm_SearchTarget = new FormGroup({
    SearchTarget: new FormControl(''),
    Active: new FormControl('0'),
    BrokerRef: new FormControl(''),
  });

  EditForm_PatternGood = new FormGroup({
    PatternRef: new FormControl('0'),
    GoodRef: new FormControl('0'),
  });



  constructor() {
    super();
  }


  ngOnInit(): void {



    this.column_name_1 = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionPatternList,
        width: 120,
      },
      {
        field: 'PatternCode',
        headerName: 'کد  ',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'Title',
        headerName: 'نام ',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'Explain',
        headerName: 'توضیحات',

        cellClass: 'text-center',
        minWidth: 150
      },

    ];

    this.columnDefs2 = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionPatternGoodList,
        width: 80,
      },
      {
        field: 'Title',
        headerName: 'نام ',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'GoodName',
        headerName: 'نام آیتم',
        cellClass: 'text-center',
        minWidth: 150
      },



    ];

    this.columnDefs3 = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionGoodListList,
        width: 80,

      },
      {
        field: 'GoodName',
        headerName: 'نام آیتم',

        cellClass: 'text-center',
        minWidth: 150,

      },
    ];

    this.getList();

    this.searchSubject_Good.pipe(
      debounceTime(1000),
    ).subscribe(() => {
      this.GetGoodList();
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

  getList(): void {

    this.repo.GetPatterns().subscribe((data: any) => {

      this.records.set(data?.Patterns ?? [])
      this.updateGridData(1, this.records());
    });
  }

  ShowGoodFromPattern(data: any): void {

    this.modal_PatternGood_title.set("لیست اقلام الگو " + data.Title)


    this.PatternCode_Selected.set(data.PatternCode)
    this.Get_PatternGood()

  }

  Get_PatternGood(): void {

    this.repo.GetGoodFromPattern(this.PatternCode_Selected()).subscribe((data: any) => {

      this.records_patternGoods.set(data?.Goods ?? [])
      this.updateGridData(2, this.records_patternGoods());
      this.patterngood_dialog_show()
    });
  }


  New_Pattern(): void {
    this.EditForm_Pattern.patchValue({
      PatternCode: "0",
      Title: "",
      Explain: "",
    });
    this.modal_Pattern_title.set("ایجاد الگو جدید")
    this.patterndetail_dialog_show()
  }

  Edit_Pattern(data: any): void {
    this.EditForm_Pattern.patchValue({
      PatternCode: data.PatternCode,
      Title: data.Title,
      Explain: data.Explain,
    });
    this.modal_Pattern_title.set("اصلاح الگو ")

    this.patterndetail_dialog_show()

  }


  submit_pattern(): void {

    this.EditForm_Pattern.markAllAsTouched();
    if (!this.EditForm_Pattern.valid) return;


    this.repo.Pattern_Crud(this.EditForm_Pattern.value).subscribe((data: any) => {
      this.notificationService.succeded()
      this.getList()
      this.patterndetail_dialog_close()
    });




  }






  Searchtarget_Good = signal('')

  private searchSubject_Good: Subject<string> = new Subject();

  onInputChange_Customer() {
    this.searchSubject_Good.next(this.Searchtarget_Good());
  }

  ShowGoodList_Modal(): void {
    this.goodlist_dialog_show()
    this.GetGoodList()
  }

  GetGoodList(): void {

    this.Good_repo.GetGoodListSupport(this.Searchtarget_Good()).subscribe((data: any) => {

      this.records_goods.set(data?.Goods ?? [])
      this.updateGridData(3, this.records_goods());

    });

  }



  Set_Good(data: any): void {
    this.EditForm_PatternGood.patchValue({
      PatternRef: this.PatternCode_Selected(),
      GoodRef: data.GoodCode
    });


    this.repo.PatternGood_Add(this.EditForm_PatternGood.value).subscribe((data: any) => {
      this.notificationService.succeded()
      this.goodlist_dialog_close()
      this.Get_PatternGood()
    });


  }


  DeleteGoodFromPattern(data: any): void {

    this.repo.PatternGood_Del(data.PatternGoodCode).subscribe((data: any) => {
      this.notificationService.succeded()
      this.goodlist_dialog_close()
      this.Get_PatternGood()
    });

  }


  @ViewChild('patterngood', { static: false }) patterngood!: ElementRef<HTMLDivElement>;
  @ViewChild('patterndetail', { static: false }) patterndetail!: ElementRef<HTMLDivElement>;
  @ViewChild('goodlist', { static: false }) goodlist!: ElementRef<HTMLDivElement>;

  patterngood_dialog_show(): void {
    const modal = this.patterngood?.nativeElement;
    if (!modal) return;
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }

  patterngood_dialog_close(): void {
    const modal = this.patterngood?.nativeElement;
    if (!modal) return;
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }

  patterndetail_dialog_show(): void {
    const modal = this.patterndetail?.nativeElement;
    if (!modal) return;
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }

  patterndetail_dialog_close(): void {
    const modal = this.patterndetail?.nativeElement;
    if (!modal) return;
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }


  goodlist_dialog_show(): void {
    const modal = this.goodlist?.nativeElement;
    if (!modal) return;
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }

  goodlist_dialog_close(): void {
    const modal = this.goodlist?.nativeElement;
    if (!modal) return;
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }



}
