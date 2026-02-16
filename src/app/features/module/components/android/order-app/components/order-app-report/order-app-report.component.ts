import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { IDatepickerTheme, NgPersianDatepickerModule } from 'ng-persian-datepicker';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { Base_Lookup } from 'src/app/app-shell/framework-services/model/lookup-type';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';
import { ThemeService } from 'src/app/app-shell/framework-services/ui/theme.service';
import { OrderWebApiService } from 'src/app/features/module/services/OrderWebApi.service';

@Component({
  selector: 'app-order-app-report',
  templateUrl: './order-app-report.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AgGridModule,
    NgPersianDatepickerModule,

  ],
})
export class OrderAppReportComponent extends AgGridBaseComponent
  implements OnInit {


  private readonly repo = inject(OrderWebApiService);


  constructor() {
    super();
  }


  toggleTheme() {
    this.themeService.toggleTheme(); // از سرویس تم استفاده کن
  }


  Filter_Lookup: Base_Lookup[] = [
    { id: "4", name: "تولید" },
    { id: "5", name: "حذف شده" }
  ]

  EditForm_Complete = new FormGroup({
    StartDate: new FormControl(),
    EndDate: new FormControl(),
    Filter: new FormControl("4"),
  });



  records;
  title = 'لیست کالاها ';
  StartDate = new FormControl();
  EndDate = new FormControl();

  Searchtarget: string = '';

  onInputChange() {
    if (this.Searchtarget == "") {
      this.Searchtarget = ""
    }
    // this.getList()
  }


  ngOnInit(): void {
    this.themeSub = this.themeService.theme$.subscribe(mode => {
      this.isDarkMode = (mode === 'dark');
    });

    this.columnDefs1 = [


      {
        field: 'GoodName',
        headerName: 'نام کالا  ',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
      },
      {
        field: 'Amount',
        headerName: 'تعداد',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
      },
      {
        field: 'FactorDate',
        headerName: 'تاریخ فاکتور',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
      },
      {
        field: 'GoodExplain1',
        headerName: 'گروه',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
      },

    ];

    // this.getList();
  }


  customTheme: Partial<IDatepickerTheme> = {
    selectedBackground: '#D68E3A',
    selectedText: '#FFFFFF',

  };


  getList() {

    //      
    this.repo.GetOrderPanel(this.StartDate.value, this.EndDate.value, "4").subscribe((data: any) => {
      //   this.records = e;

      // });



      this.repo.GetOrderPanel(this.EditForm_Complete.value.StartDate, this.EditForm_Complete.value.EndDate, this.EditForm_Complete.value.Filter).subscribe(e => {
        this.records = data;


      });




    })
  }


}

