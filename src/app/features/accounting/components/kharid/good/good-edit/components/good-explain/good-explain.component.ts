import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit, Renderer2, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { GoodWebApiService } from 'src/app/features/accounting/services/KharidWebApi/goodWebApi.service';
@Component({
  selector: 'app-good-explain',
  templateUrl: './good-explain.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,

  ]
})
export class GoodExplainComponent implements OnInit {
  @Input() GoodCode = ""

  private readonly router = inject(Router);
  private readonly repo = inject(GoodWebApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly notificationService = inject(NotificationService);
  private readonly renderer = inject(Renderer2);

  constructor() { }

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





  EditForm_Explain_temp = new FormGroup({

    GoodCode: new FormControl(0),
    GoodSubCode: new FormControl(0),
    GoodName: new FormControl(''),
    GoodExplain1: new FormControl(''),
    GoodExplain2: new FormControl(''),
    GoodExplain3: new FormControl(''),
    GoodExplain4: new FormControl(''),
    GoodExplain5: new FormControl(''),
    GoodExplain6: new FormControl(''),
  });


  EditForm_Explain = new FormGroup({
    GoodIndex: new FormControl("1"),

    GoodCode: new FormControl(0),
    GoodSubCode: new FormControl(0),
    GoodName: new FormControl(''),
    GoodExplain1: new FormControl(''),
    GoodExplain2: new FormControl(''),
    GoodExplain3: new FormControl(''),
    GoodExplain4: new FormControl(''),
    GoodExplain5: new FormControl(''),
    GoodExplain6: new FormControl(''),
  });





  ngOnInit() {
    this.Code.set(this.GoodCode)
    this.getDetails()
  }



  getDetails() {

    this.changedValues.set([])
    this.EditForm_Explain.reset();

    this.LoadData_explain()


  }


  LoadData_explain() {
    // Initialize form tracking for changes



    // Initial data fetch

    this.repo.GetGood_Explain(this.Code()).subscribe((data: any) => {

      this.EditForm_Explain.patchValue({
        GoodCode: data.Goods[0].GoodCode,
        GoodSubCode: data.Goods[0].GoodSubCode,
        GoodName: data.Goods[0].GoodName,
        GoodExplain1: data.Goods[0].GoodExplain1,
        GoodExplain2: data.Goods[0].GoodExplain2,
        GoodExplain3: data.Goods[0].GoodExplain3,
        GoodExplain4: data.Goods[0].GoodExplain4,
        GoodExplain5: data.Goods[0].GoodExplain5,
        GoodExplain6: data.Goods[0].GoodExplain6,
      });

      this.EditForm_Explain_temp.patchValue({
        GoodCode: data.Goods[0].GoodCode,
        GoodSubCode: data.Goods[0].GoodSubCode,
        GoodName: data.Goods[0].GoodName,
        GoodExplain1: data.Goods[0].GoodExplain1,
        GoodExplain2: data.Goods[0].GoodExplain2,
        GoodExplain3: data.Goods[0].GoodExplain3,
        GoodExplain4: data.Goods[0].GoodExplain4,
        GoodExplain5: data.Goods[0].GoodExplain5,
        GoodExplain6: data.Goods[0].GoodExplain6,
      });
      this.EditForm_Explain.valueChanges.subscribe((value) => {
        this.trackChanges(value);
      });

      // Initialize the form's original state to compare changes later
      this.originalValues = { ...this.EditForm_Explain.value };
      this.changedValues.set([])
    });

  }

  changedValues_cansel_explain() {
    this.EditForm_Explain.patchValue({
      GoodCode: this.EditForm_Explain_temp.value.GoodCode,
      GoodSubCode: this.EditForm_Explain_temp.value.GoodSubCode,
      GoodName: this.EditForm_Explain_temp.value.GoodName,
      GoodExplain1: this.EditForm_Explain_temp.value.GoodExplain1,
      GoodExplain2: this.EditForm_Explain_temp.value.GoodExplain2,
      GoodExplain3: this.EditForm_Explain_temp.value.GoodExplain3,
      GoodExplain4: this.EditForm_Explain_temp.value.GoodExplain4,
      GoodExplain5: this.EditForm_Explain_temp.value.GoodExplain5,
      GoodExplain6: this.EditForm_Explain_temp.value.GoodExplain6,
    });

    this.changedValues.set([])


  }

  submit(action) {

    if (action == 'explain') {
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
