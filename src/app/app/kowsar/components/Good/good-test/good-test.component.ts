import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-good-test',
  templateUrl: './good-test.component.html',
})
export class GoodTestComponent implements OnInit {

  constructor() { }


  EditForm_Base = new FormGroup({
    GoodCode: new FormControl(0),
    GoodType: new FormControl('sss'),
    GoodName: new FormControl('sss'),
    Type: new FormControl(0),
    UsedGood: new FormControl(0),
    GoodSubCode: new FormControl(0),
    MinSellPrice: new FormControl(0),
    MaxSellPrice: new FormControl(0),
    Isbn: new FormControl('sssdd'),
    FirstBarCode: new FormControl('ddss'),
    BarCodePrintState: new FormControl('ssd'),
    SellPriceType: new FormControl('sds'),
    SellPrice1: new FormControl(0),
    SellPrice2: new FormControl(0),
    SellPrice3: new FormControl(0),
    SellPrice4: new FormControl(0),
    SellPrice5: new FormControl(0),
    SellPrice6: new FormControl(0),
  });





  KowsarTemplate = new FormGroup({
    Goods: new FormArray([])
  });



  Add_To_KowsarTemplate() {
    (this.KowsarTemplate.get('Goods') as FormArray).push(
      this.EditForm_Base
    );
    return JSON.stringify(this.KowsarTemplate.value)
  }




  ngOnInit() {

    this.Add_To_KowsarTemplate()
  }

}
