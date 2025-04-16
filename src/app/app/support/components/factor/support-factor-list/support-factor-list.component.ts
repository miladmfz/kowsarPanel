import { Component, OnInit, Renderer2 } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { FactorWebApiService } from 'src/app/app/factor/services/FactorWebApi.service';
import { SupportFactorWebApiService } from '../../../services/SupportFactorWebApi.service';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { FormControl, FormGroup } from '@angular/forms';
import { IDatepickerTheme } from 'ng-persian-datepicker';
import { CellActionSupportFactorList } from './cell-action-support-factor-list';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-support-factor-list',
  templateUrl: './support-factor-list.component.html',
})
export class SupportFactorListComponent extends AgGridBaseComponent
  implements OnInit {

  constructor(
    private readonly router: Router,
    private repo: SupportFactorWebApiService,
    private renderer: Renderer2

  ) {
    super();
  }

  title = 'فاکتور پشتیبانی';
  CentralRef: string = '';
  JobPersonRef: string = '';
  Searchtarget: string = '';
  TextData: string = '';
  BrokerRef: string = '';
  BrokerRef_temp: string = '';

  searchTerm: string = '';
  selectedOption: string = '0';



  items: any[] = [];

  start_dateValue = new FormControl();
  End_dateValue = new FormControl();
  loading: boolean = true;

  records;


  loading_supportpanel: boolean = true;


  reportData: any[] = [];




  customTheme: Partial<IDatepickerTheme> = {
    selectedBackground: '#D68E3A',
    selectedText: '#FFFFFF',

  };

  EditForm_supportfactor = new FormGroup({
    StartDateTarget: new FormControl(''),
    EndDateTarget: new FormControl(''),
    SearchTarget: new FormControl(''),
    BrokerRef: new FormControl(''),
    isShopFactor: new FormControl('0'),

  });

  EditForm_supportfactor_property = new FormGroup({
    starttime: new FormControl(''),
    Endtime: new FormControl(''),
    worktime: new FormControl(''),
    Barbary: new FormControl(''),
    ObjectRef: new FormControl('0'),

  });

  submit(action) {
  }

  onInputChange() {
    if (this.Searchtarget == "") {
      this.Searchtarget = ""
    }
    this.getList()

  }





  override ngOnInit(): void {
    super.ngOnInit();


    if (sessionStorage.getItem("PhAddress3") == '100') {
      this.BrokerRef = ''

    } else {
      this.BrokerRef = sessionStorage.getItem("BrokerCode")

    }


    this.getList();
    this.getpanel_data()




  }

  navigateToEdit(id) {
    this.router.navigate(['/support/support-factor-edit', id]);


  }





  getpanel_data() {
    this.repo.GetSupportPanel().subscribe((data: any) => {
      if (this.BrokerRef == '') {
        this.reportData = data.Panels;
      } else {
        this.reportData = data.Panels.filter(panel => panel.BrokerCode === this.BrokerRef);

        this.reportData.forEach(row => {
          if (row.WithoutRows > 0 || row.OpenFactor > 0) {
            this.loading_supportpanel = false
          }
        });
      }

    });

  }
  getGridSchema() {
    this.repo.GetGridSchema('TFactor').subscribe((data: any) => {
      if (data && data.GridSchemas && data.GridSchemas.length > 0) {
        this.columnDefs = data.GridSchemas.filter(schema => schema.Visible === "True").map(schema => ({
          field: schema.FieldName,
          headerName: schema.Caption,
          cellClass: 'text-center',
          filter: 'agSetColumnFilter',
          sortable: true,
          resizable: true,
          minWidth: parseInt(schema.Width),
          valueFormatter: schema.Separator === '1' ? this.customNumberFormatter : undefined
        }));

        this.columnDefs.unshift({
          field: 'عملیات',
          pinned: 'left',
          cellRenderer: CellActionSupportFactorList,

          width: 100,
          sortable: false,
          filter: false,
          // resizable: false
        });
      }
      this.EditForm_supportfactor.patchValue({
        BrokerRef: this.BrokerRef,
        isShopFactor: "0",
      });
      this.loading = true

      this.repo.GetSupportFactors(this.EditForm_supportfactor.value).subscribe((data: any) => {

        console.log(data.Factors);
        this.records = data.Factors;
        this.loading = false

      });


    });
  }

  customNumberFormatter(params) {
    if (params.value === null || params.value === undefined) {
      return ''; // اگر مقدار خالی است، چیزی نمایش نده.
    }

    // اطمینان حاصل کن که مقدار یک عدد است
    let value = parseFloat(params.value);
    if (isNaN(value)) {
      return params.value; // اگر مقدار عددی نیست، همان مقدار اولیه را برگردان.
    }

    // فرمت اعداد با کاما برای جداسازی هر سه رقم و حذف صفرهای اضافی در اعشار
    let formattedValue = value.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 20 // حداکثر تعداد رقم‌های اعشار را بزرگ بگیر تا هنگام حذف، دقیق باشد.
    });

    // حذف صفرهای اضافی اعشاری اگر لازم باشد
    if (formattedValue.indexOf('.') > -1) {
      formattedValue = formattedValue.replace(/\.?0+$/, '');
    }

    return formattedValue;
  }



  getList() {

    this.getGridSchema()

    /*


*/

  }





  Edit_factor_Property(FactorCode) {

    this.property_dialog_show()
    this.records.forEach((factor: any) => {

      if (factor.FactorCode == FactorCode) {
        this.EditForm_supportfactor_property.patchValue({
          starttime: factor.starttime,
          Endtime: factor.Endtime,
          worktime: factor.worktime,
          Barbary: factor.Barbary,
          ObjectRef: factor.FactorCode,
        });
      }


    })
  }





  Set_factor_Property() {

    this.repo.EditFactorProperty(this.EditForm_supportfactor_property.value).subscribe((data: any) => {
      this.property_dialog_close()
      this.getList()
      this.EditForm_supportfactor_property.reset()
    });



  }


  property_dialog_show() {
    const modal = this.renderer.selectRootElement('#supportfactorproperty', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }
  property_dialog_close() {
    const modal = this.renderer.selectRootElement('#supportfactorproperty', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }


}



