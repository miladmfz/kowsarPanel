import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit, Renderer2, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { GoodWebApiService } from 'src/app/features/accounting/services/KharidWebApi/goodWebApi.service';
@Component({
  selector: 'app-good-complete',
  templateUrl: './good-complete.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,

  ]
})
export class GoodCompleteComponent implements OnInit {
  @Input() GoodCode = ""

  private readonly router = inject(Router);
  private readonly repo = inject(GoodWebApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly notificationService = inject(NotificationService);
  private readonly renderer = inject(Renderer2);

  constructor() {

  }

  Code = signal('')
  Code_int = signal(0)


  KowsarTemplate = new FormGroup({
    Good: new FormArray([])
  });


  JsonForm = new FormGroup({
    JsonData: new FormControl(""),
  });

  originalValues: any = {};
  changedValues = signal<any[]>([])

  EditForm_Complete = new FormGroup({
    GoodIndex: new FormControl("1"),

    GoodCode: new FormControl(0),
    GoodSubCode: new FormControl(0),
    GoodName: new FormControl(''),
    MaxSellPrice: new FormControl(0),
    MinSellPrice: new FormControl(0),
    MinAmount: new FormControl(0),
    MaxAmount: new FormControl(0),
    SefareshPoint: new FormControl(0),
    MinBuyPrice: new FormControl(0),
    MaxBuyPrice: new FormControl(0),
    CriticalPoint: new FormControl(0),
    MayorTax: new FormControl(0),
    Tax: new FormControl(0),
  });

  EditForm_Complete_temp = new FormGroup({
    GoodCode: new FormControl(0),
    GoodSubCode: new FormControl(0),
    GoodName: new FormControl(''),
    MaxSellPrice: new FormControl(0),
    MinSellPrice: new FormControl(0),
    MinAmount: new FormControl(0),
    MaxAmount: new FormControl(0),
    SefareshPoint: new FormControl(0),
    MinBuyPrice: new FormControl(0),
    MaxBuyPrice: new FormControl(0),
    CriticalPoint: new FormControl(0),
    MayorTax: new FormControl(0),
    Tax: new FormControl(0),
  });






  trackChanges(value: any) {
    this.changedValues()['GoodCode'] = value['GoodCode'];
    // Compare the current form values with the original values
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        if (value[key] !== this.originalValues[key]) {
          this.changedValues()[key] = value[key]; // Store the changed value
        } else if (key !== 'GoodCode') {
          // If it matches the original and it's not GoodCode, remove it from changedValues()
          delete this.changedValues()[key];
        }

      }
    }
  }


  changedValues_show() {
    return Object.keys(this.changedValues()).length > 0
  }






  ngOnInit() {
    this.Code.set(this.GoodCode)
    this.getDetails()
  }



  getDetails() {

    this.changedValues.set([])
    this.EditForm_Complete.reset();


    this.LoadData_complete()



  }


  LoadData_complete() {




    this.repo.GetGood_Complete(this.Code()).subscribe((data: any) => {


      this.EditForm_Complete.patchValue({
        GoodCode: data.Goods[0].GoodCode,
        GoodName: data.Goods[0].GoodName,
        GoodSubCode: data.Goods[0].GoodSubCode,
        MaxSellPrice: data.Goods[0].MaxSellPrice,
        MinSellPrice: data.Goods[0].MinSellPrice,
        MinAmount: data.Goods[0].MinAmount,
        MaxAmount: data.Goods[0].MaxAmount,
        SefareshPoint: data.Goods[0].SefareshPoint,
        MinBuyPrice: data.Goods[0].MinBuyPrice,
        MaxBuyPrice: data.Goods[0].MaxBuyPrice,
        CriticalPoint: data.Goods[0].CriticalPoint,
        MayorTax: data.Goods[0].MayorTax,
        Tax: data.Goods[0].Tax,
      });


      this.EditForm_Complete_temp.patchValue({
        GoodCode: this.EditForm_Complete.value.GoodCode,
        GoodName: this.EditForm_Complete.value.GoodName,
        GoodSubCode: this.EditForm_Complete.value.GoodSubCode,
        MaxSellPrice: this.EditForm_Complete.value.MaxSellPrice,
        MinSellPrice: this.EditForm_Complete.value.MinSellPrice,
        MinAmount: this.EditForm_Complete.value.MinAmount,
        MaxAmount: this.EditForm_Complete.value.MaxAmount,
        SefareshPoint: this.EditForm_Complete.value.SefareshPoint,
        MinBuyPrice: this.EditForm_Complete.value.MinBuyPrice,
        MaxBuyPrice: this.EditForm_Complete.value.MaxBuyPrice,
        CriticalPoint: this.EditForm_Complete.value.CriticalPoint,
        MayorTax: this.EditForm_Complete.value.MayorTax,
        Tax: this.EditForm_Complete.value.Tax,
      });

      this.EditForm_Complete.valueChanges.subscribe((value) => {
        this.trackChanges(value);
      });

      // Initialize the form's original state to compare changes later
      this.originalValues = { ...this.EditForm_Complete.value };

      this.changedValues.set([])
    });


  }


  changedValues_cansel_complete() {

    this.EditForm_Complete.patchValue({
      GoodCode: this.EditForm_Complete_temp.value.GoodCode,
      GoodName: this.EditForm_Complete_temp.value.GoodName,
      GoodSubCode: this.EditForm_Complete_temp.value.GoodSubCode,
      MaxSellPrice: this.EditForm_Complete_temp.value.MaxSellPrice,
      MinSellPrice: this.EditForm_Complete_temp.value.MinSellPrice,
      MinAmount: this.EditForm_Complete_temp.value.MinAmount,
      MaxAmount: this.EditForm_Complete_temp.value.MaxAmount,
      SefareshPoint: this.EditForm_Complete_temp.value.SefareshPoint,
      MinBuyPrice: this.EditForm_Complete_temp.value.MinBuyPrice,
      MaxBuyPrice: this.EditForm_Complete_temp.value.MaxBuyPrice,
      CriticalPoint: this.EditForm_Complete_temp.value.CriticalPoint,
      MayorTax: this.EditForm_Complete_temp.value.MayorTax,
      Tax: this.EditForm_Complete_temp.value.Tax,
    });

    this.changedValues.set([])


  }



  submit(action) {



    if (action == 'complete') {
      if (Object.keys(this.changedValues()).length > 0) {


        (this.KowsarTemplate.get('Good') as FormArray).clear();


        const formGroup = new FormGroup(
          Object.keys(this.changedValues()).reduce((acc, key) => {
            acc[key] = new FormControl(this.changedValues()[key]);
            return acc;
          }, {})
        );


        (this.KowsarTemplate.get('Good') as FormArray).push(formGroup);



        this.JsonForm.patchValue({
          JsonData: JSON.stringify(this.KowsarTemplate.value)
        });






        this.repo.GoodCrudService(this.JsonForm.value).subscribe((data: any) => {


          const result = JSON.parse(data.Goods[0].Result);

          if (result.Good && result.Good[0].ErrMessage === "") {
            this.notificationService.succeded();
            this.changedValues.set([])
            this.getDetails()
          } else {
            this.notificationService.error(result.Good[0].ErrMessage);
          }

        });


      } else {
      }


    }


  }
}
