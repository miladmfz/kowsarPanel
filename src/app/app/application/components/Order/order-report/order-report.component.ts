import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { OrderWebApiService } from '../../../services/OrderWebApi.service';
import { FormControl, FormGroup } from '@angular/forms';
import { IDatepickerTheme } from 'ng-persian-datepicker';
import { Base_Lookup } from 'src/app/app/kowsar/lookup-type';
import { ThemeService } from 'src/app/app-shell/framework-services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-order-report',
  templateUrl: './order-report.component.html',
})
export class OrderReportComponent extends AgGridBaseComponent
  implements OnInit {

  constructor(
    private readonly router: Router,
    private repo: OrderWebApiService,
    private themeService: ThemeService
  ) {
    super();
  }

  isDarkMode: boolean = false;
  private themeSub!: Subscription;

  toggleTheme() {
    this.themeService.toggleTheme(); // از سرویس تم استفاده کن
  }
  ngOnDestroy() {

    this.themeSub.unsubscribe();

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
    this.getList()
  }


  override ngOnInit(): void {
    super.ngOnInit();
    this.themeSub = this.themeService.theme$.subscribe(mode => {
      this.isDarkMode = (mode === 'dark');
    });

    this.columnDefs = [


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

    this.getList();
  }


  customTheme: Partial<IDatepickerTheme> = {
    selectedBackground: '#D68E3A',
    selectedText: '#FFFFFF',

  };


  getList() {

    // this.repo.GetOrderPanel(this.StartDate.value, this.EndDate.value, "4").subscribe(e => {
    //   this.records = e;

    // });


    this.repo.GetOrderPanel(this.EditForm_Complete.value.StartDate, this.EditForm_Complete.value.EndDate, this.EditForm_Complete.value.Filter).subscribe(e => {
      this.records = e;

    });

    // this.repo.GetOrderPanel("30", this.Searchtarget, "0").subscribe((data) => {
    //   this.records = data;

    // });




  }


}

















































/*

implements OnInit {

constructor(
private repo: KowsarWebApiService,
private route: ActivatedRoute,

) { }

items: any[] = [];
TextData: string = '';
selectedOption: string = '0';
dateValue = new FormControl();
id: string = "0";

Searchtarget: string = '';
CentralRef: string = '';
GroupCode_str: string = '0';



ngOnInit() {

if (this.route.snapshot.params['id']) {
  this.id = this.route.snapshot.params['id'];
}

if (parseInt(this.id) > 0) {
  this.GroupCode_str = this.id
  this.LoadList();
} else {
  this.repo.kowsar_info("AppOrder_DefaultGroupCode").subscribe(e => {

    this.GroupCode_str = e[0].DataValue
    this.LoadList();
  });
}



}


onInputChange() {

}


LoadList() {

this.repo.GetOrderGoodList("30", this.Searchtarget, this.GroupCode_str).subscribe(e => {
  this.items = e;
   this.items);

});

}






}
*/