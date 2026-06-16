import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit, Renderer2, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { KowsarBaseWebApi } from 'src/app/app-shell/framework-services/base/KowsarBaseWebApi.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { GoodWebApiService } from 'src/app/features/accounting/services/KharidWebApi/goodWebApi.service';

import * as convert from 'xml-js';

@Component({
  selector: 'app-kowsar-property',
  templateUrl: './kowsar-property.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,

  ]
})
export class KowsarPropertyComponent implements OnInit {
  @Input() ObjectRef = ""
  @Input() ClassName = ""
  @Input() ObjectType = ""

  private readonly router = inject(Router);
  private readonly repo = inject(KowsarBaseWebApi);
  private readonly route = inject(ActivatedRoute);
  private readonly notificationService = inject(NotificationService);
  private readonly renderer = inject(Renderer2);

  constructor() { }


  Code = signal('')
  Code_int = signal(0)
  Errormsg_property = signal('')
  Propertys = signal<any[]>([])





  // ObjectToProperty = new FormGroup({
  //   RowIndex: new FormControl("1"),
  //   ObjectRef: new FormControl(""),

  //   PropertyValue: new FormControl("")
  // });



  propertyDto = new FormGroup({
    ObjectRef: new FormControl(''),
    ObjectType: new FormControl(''),
    ClassName: new FormControl(''),
    PropertyName: new FormControl(''),
    PropertyType: new FormControl(''),
    PropertyValueMap: new FormControl(''),
  });


  KowsarTemplate = new FormGroup({
    PropertyValue: new FormArray([])
  });


  JsonForm = new FormGroup({
    JsonData: new FormControl(""),
    TableName: new FormControl(""),
  });

  originalValues: any = {};
  changedValues = signal<any[]>([])

  EditForm_Property = new FormGroup({
    RowIndex: new FormControl("1"),

    ObjectRef: new FormControl(0),
    ClassName: new FormControl(""),

    Nvarchar1: new FormControl(''),
    Nvarchar2: new FormControl(''),
    Nvarchar3: new FormControl(''),
    Nvarchar4: new FormControl(''),
    Nvarchar5: new FormControl(''),
    Nvarchar6: new FormControl(''),
    Nvarchar7: new FormControl(''),
    Nvarchar8: new FormControl(''),
    Nvarchar9: new FormControl(''),
    Nvarchar10: new FormControl(''),
    Nvarchar11: new FormControl(''),
    Nvarchar12: new FormControl(''),
    Nvarchar13: new FormControl(''),
    Nvarchar14: new FormControl(''),
    Nvarchar15: new FormControl(''),
    Nvarchar16: new FormControl(''),
    Nvarchar17: new FormControl(''),
    Nvarchar18: new FormControl(''),
    Nvarchar19: new FormControl(''),
    Nvarchar20: new FormControl(''),
    Int1: new FormControl(0),
    Int2: new FormControl(0),
    Int3: new FormControl(0),
    Int4: new FormControl(0),
    Int5: new FormControl(0),
    Int6: new FormControl(0),
    Int7: new FormControl(0),
    Int8: new FormControl(0),
    Int9: new FormControl(0),
    Int10: new FormControl(0),
    Float1: new FormControl(0),
    Float2: new FormControl(0),
    Float3: new FormControl(0),
    Float4: new FormControl(0),
    Float5: new FormControl(0),
    Float6: new FormControl(0),
    Float7: new FormControl(0),
    Float8: new FormControl(0),
    Float9: new FormControl(0),
    Float10: new FormControl(0),
    Text1: new FormControl(''),
    Text2: new FormControl(''),
    Text3: new FormControl(''),
    Text4: new FormControl(''),
    Text5: new FormControl(''),
  });


  EditForm_Property_temp = new FormGroup({
    ObjectRef: new FormControl(0),
    ClassName: new FormControl(""),
    Nvarchar1: new FormControl(''),
    Nvarchar2: new FormControl(''),
    Nvarchar3: new FormControl(''),
    Nvarchar4: new FormControl(''),
    Nvarchar5: new FormControl(''),
    Nvarchar6: new FormControl(''),
    Nvarchar7: new FormControl(''),
    Nvarchar8: new FormControl(''),
    Nvarchar9: new FormControl(''),
    Nvarchar10: new FormControl(''),
    Nvarchar11: new FormControl(''),
    Nvarchar12: new FormControl(''),
    Nvarchar13: new FormControl(''),
    Nvarchar14: new FormControl(''),
    Nvarchar15: new FormControl(''),
    Nvarchar16: new FormControl(''),
    Nvarchar17: new FormControl(''),
    Nvarchar18: new FormControl(''),
    Nvarchar19: new FormControl(''),
    Nvarchar20: new FormControl(''),
    Int1: new FormControl(0),
    Int2: new FormControl(0),
    Int3: new FormControl(0),
    Int4: new FormControl(0),
    Int5: new FormControl(0),
    Int6: new FormControl(0),
    Int7: new FormControl(0),
    Int8: new FormControl(0),
    Int9: new FormControl(0),
    Int10: new FormControl(0),
    Float1: new FormControl(0),
    Float2: new FormControl(0),
    Float3: new FormControl(0),
    Float4: new FormControl(0),
    Float5: new FormControl(0),
    Float6: new FormControl(0),
    Float7: new FormControl(0),
    Float8: new FormControl(0),
    Float9: new FormControl(0),
    Float10: new FormControl(0),
    Text1: new FormControl(''),
    Text2: new FormControl(''),
    Text3: new FormControl(''),
    Text4: new FormControl(''),
    Text5: new FormControl(''),
  });


  ngOnInit() {

    this.Code.set(this.ObjectRef)
    this.getDetails()
  }



  getDetails() {

    this.changedValues.set([])
    this.EditForm_Property.reset();


    this.LoadData_property()


  }


  setinitial_property() {



    this.EditForm_Property.valueChanges.subscribe((value) => {
      this.trackChanges(value);
    });

    // Initialize the form's original state to compare changes later
    this.originalValues = { ...this.EditForm_Property.value };
    this.EditForm_Property.patchValue({
      ObjectRef: parseInt(this.Code()),
      ClassName: this.ClassName,
      Nvarchar1: "",
    });

    // this.ObjectToProperty.patchValue({
    //   ObjectRef: this.Code(),
    //   PropertyValue: JSON.parse(JSON.stringify(formGroup.value)),
    // });



    (this.KowsarTemplate.get("PropertyValue") as FormArray).clear();
    const formGroup = new FormGroup(
      Object.keys(this.changedValues()).reduce((acc, key) => {
        acc[key] = new FormControl(this.changedValues()[key]);
        return acc;
      }, {})
    );


    (this.KowsarTemplate.get("PropertyValue") as FormArray).push(formGroup);
    this.JsonForm.patchValue({
      JsonData: JSON.stringify(this.KowsarTemplate.value),
      TableName: this.ClassName
    });



    this.repo.PropertyValueCrudService(this.JsonForm.value).subscribe((data: any) => {

      const result = JSON.parse(data.PropertyValues[0].Result);

      if (result.PropertyValue && result.PropertyValue[0].ErrMessage === "") {
        this.notificationService.succeded();
        this.changedValues.set([])
        this.LoadData_property()
      } else {
        this.notificationService.error(result.PropertyValue[0].ErrMessage);
      }

    });



  }

  LoadData_property() {

    this.propertyDto.patchValue({
      ObjectRef: this.Code(),
      ClassName: "T" + this.ClassName,
      ObjectType: this.ObjectType,
    });

    this.repo.GetPropertyValueData(this.propertyDto.value).subscribe((data: any) => {

      if (data.response.Errormessage.length > 0) {

        this.setinitial_property()
      } else {

        this.Errormsg_property.set("")
        // this.GoodTypeStr.set(data.PropertyValues[0].GoodType)

        this.EditForm_Property.patchValue({
          ObjectRef: data.PropertyValues[0].ObjectRef,
          ClassName: data.PropertyValues[0].ClassName
          ,
          // GoodType: data.PropertyValues[0].GoodType,
          Nvarchar1: data.PropertyValues[0].Nvarchar1,
          Nvarchar2: data.PropertyValues[0].Nvarchar2,
          Nvarchar3: data.PropertyValues[0].Nvarchar3,
          Nvarchar4: data.PropertyValues[0].Nvarchar4,
          Nvarchar5: data.PropertyValues[0].Nvarchar5,
          Nvarchar6: data.PropertyValues[0].Nvarchar6,
          Nvarchar7: data.PropertyValues[0].Nvarchar7,
          Nvarchar8: data.PropertyValues[0].Nvarchar8,
          Nvarchar9: data.PropertyValues[0].Nvarchar9,
          Nvarchar10: data.PropertyValues[0].Nvarchar10,
          Nvarchar11: data.PropertyValues[0].Nvarchar11,
          Nvarchar12: data.PropertyValues[0].Nvarchar12,
          Nvarchar13: data.PropertyValues[0].Nvarchar13,
          Nvarchar14: data.PropertyValues[0].Nvarchar14,
          Nvarchar15: data.PropertyValues[0].Nvarchar15,
          Nvarchar16: data.PropertyValues[0].Nvarchar16,
          Nvarchar17: data.PropertyValues[0].Nvarchar17,
          Nvarchar18: data.PropertyValues[0].Nvarchar18,
          Nvarchar19: data.PropertyValues[0].Nvarchar19,
          Nvarchar20: data.PropertyValues[0].Nvarchar20,
          Int1: data.PropertyValues[0].Int1,
          Int2: data.PropertyValues[0].Int2,
          Int3: data.PropertyValues[0].Int3,
          Int4: data.PropertyValues[0].Int4,
          Int5: data.PropertyValues[0].Int5,
          Int6: data.PropertyValues[0].Int6,
          Int7: data.PropertyValues[0].Int7,
          Int8: data.PropertyValues[0].Int8,
          Int9: data.PropertyValues[0].Int9,
          Int10: data.PropertyValues[0].Int10,
          Float1: data.PropertyValues[0].Float1,
          Float2: data.PropertyValues[0].Float2,
          Float3: data.PropertyValues[0].Float3,
          Float4: data.PropertyValues[0].Float4,
          Float5: data.PropertyValues[0].Float5,
          Float6: data.PropertyValues[0].Float6,
          Float7: data.PropertyValues[0].Float7,
          Float8: data.PropertyValues[0].Float8,
          Float9: data.PropertyValues[0].Float9,
          Float10: data.PropertyValues[0].Float10,
          Text1: data.PropertyValues[0].Text1,
          Text2: data.PropertyValues[0].Text2,
          Text3: data.PropertyValues[0].Text3,
          Text4: data.PropertyValues[0].Text4,
          Text5: data.PropertyValues[0].Text5,
        });

        this.EditForm_Property_temp.patchValue({
          ObjectRef: data.PropertyValues[0].ObjectRef,
          ClassName: data.PropertyValues[0].ClassName,
          // GoodType: data.PropertyValues[0].GoodType,
          Nvarchar1: data.PropertyValues[0].Nvarchar1,
          Nvarchar2: data.PropertyValues[0].Nvarchar2,
          Nvarchar3: data.PropertyValues[0].Nvarchar3,
          Nvarchar4: data.PropertyValues[0].Nvarchar4,
          Nvarchar5: data.PropertyValues[0].Nvarchar5,
          Nvarchar6: data.PropertyValues[0].Nvarchar6,
          Nvarchar7: data.PropertyValues[0].Nvarchar7,
          Nvarchar8: data.PropertyValues[0].Nvarchar8,
          Nvarchar9: data.PropertyValues[0].Nvarchar9,
          Nvarchar10: data.PropertyValues[0].Nvarchar10,
          Nvarchar11: data.PropertyValues[0].Nvarchar11,
          Nvarchar12: data.PropertyValues[0].Nvarchar12,
          Nvarchar13: data.PropertyValues[0].Nvarchar13,
          Nvarchar14: data.PropertyValues[0].Nvarchar14,
          Nvarchar15: data.PropertyValues[0].Nvarchar15,
          Nvarchar16: data.PropertyValues[0].Nvarchar16,
          Nvarchar17: data.PropertyValues[0].Nvarchar17,
          Nvarchar18: data.PropertyValues[0].Nvarchar18,
          Nvarchar19: data.PropertyValues[0].Nvarchar19,
          Nvarchar20: data.PropertyValues[0].Nvarchar20,
          Int1: data.PropertyValues[0].Int1,
          Int2: data.PropertyValues[0].Int2,
          Int3: data.PropertyValues[0].Int3,
          Int4: data.PropertyValues[0].Int4,
          Int5: data.PropertyValues[0].Int5,
          Int6: data.PropertyValues[0].Int6,
          Int7: data.PropertyValues[0].Int7,
          Int8: data.PropertyValues[0].Int8,
          Int9: data.PropertyValues[0].Int9,
          Int10: data.PropertyValues[0].Int10,
          Float1: data.PropertyValues[0].Float1,
          Float2: data.PropertyValues[0].Float2,
          Float3: data.PropertyValues[0].Float3,
          Float4: data.PropertyValues[0].Float4,
          Float5: data.PropertyValues[0].Float5,
          Float6: data.PropertyValues[0].Float6,
          Float7: data.PropertyValues[0].Float7,
          Float8: data.PropertyValues[0].Float8,
          Float9: data.PropertyValues[0].Float9,
          Float10: data.PropertyValues[0].Float10,
          Text1: data.PropertyValues[0].Text1,
          Text2: data.PropertyValues[0].Text2,
          Text3: data.PropertyValues[0].Text3,
          Text4: data.PropertyValues[0].Text4,
          Text5: data.PropertyValues[0].Text5,
        });


        // this.EditForm_Property_temp.patchValue({
        //   GoodCode: this.EditForm_Property.value.GoodCode,
        //   GoodName: this.EditForm_Property.value.GoodName,
        //   GoodType: this.EditForm_Property.value.GoodType,
        //   Nvarchar1: this.EditForm_Property.value.Nvarchar1,
        //   Nvarchar2: this.EditForm_Property.value.Nvarchar2,
        //   Nvarchar3: this.EditForm_Property.value.Nvarchar3,
        //   Nvarchar4: this.EditForm_Property.value.Nvarchar4,
        //   Nvarchar5: this.EditForm_Property.value.Nvarchar5,
        //   Nvarchar6: this.EditForm_Property.value.Nvarchar6,
        //   Nvarchar7: this.EditForm_Property.value.Nvarchar7,
        //   Nvarchar8: this.EditForm_Property.value.Nvarchar8,
        //   Nvarchar9: this.EditForm_Property.value.Nvarchar9,
        //   Nvarchar10: this.EditForm_Property.value.Nvarchar10,
        //   Nvarchar11: this.EditForm_Property.value.Nvarchar11,
        //   Nvarchar12: this.EditForm_Property.value.Nvarchar12,
        //   Nvarchar13: this.EditForm_Property.value.Nvarchar13,
        //   Nvarchar14: this.EditForm_Property.value.Nvarchar14,
        //   Nvarchar15: this.EditForm_Property.value.Nvarchar15,
        //   Nvarchar16: this.EditForm_Property.value.Nvarchar16,
        //   Nvarchar17: this.EditForm_Property.value.Nvarchar17,
        //   Nvarchar18: this.EditForm_Property.value.Nvarchar18,
        //   Nvarchar19: this.EditForm_Property.value.Nvarchar19,
        //   Nvarchar20: this.EditForm_Property.value.Nvarchar20,
        //   Int1: this.EditForm_Property.value.Int1,
        //   Int2: this.EditForm_Property.value.Int2,
        //   Int3: this.EditForm_Property.value.Int3,
        //   Int4: this.EditForm_Property.value.Int4,
        //   Int5: this.EditForm_Property.value.Int5,
        //   Int6: this.EditForm_Property.value.Int6,
        //   Int7: this.EditForm_Property.value.Int7,
        //   Int8: this.EditForm_Property.value.Int8,
        //   Int9: this.EditForm_Property.value.Int9,
        //   Int10: this.EditForm_Property.value.Int10,
        //   Float1: this.EditForm_Property.value.Float1,
        //   Float2: this.EditForm_Property.value.Float2,
        //   Float3: this.EditForm_Property.value.Float3,
        //   Float4: this.EditForm_Property.value.Float4,
        //   Float5: this.EditForm_Property.value.Float5,
        //   Float6: this.EditForm_Property.value.Float6,
        //   Float7: this.EditForm_Property.value.Float7,
        //   Float8: this.EditForm_Property.value.Float8,
        //   Float9: this.EditForm_Property.value.Float9,
        //   Float10: this.EditForm_Property.value.Float10,
        //   Text1: this.EditForm_Property.value.Text1,
        //   Text2: this.EditForm_Property.value.Text2,
        //   Text3: this.EditForm_Property.value.Text3,
        //   Text4: this.EditForm_Property.value.Text4,
        //   Text5: this.EditForm_Property.value.Text5,
        // });
        this.EditForm_Property.valueChanges.subscribe((value) => {
          this.trackChanges(value);
        });

        // Initialize the form's original state to compare changes later
        this.originalValues = { ...this.EditForm_Property.value };

        this.changedValues.set([])






        this.repo.GetPropertyValue(this.propertyDto.value).subscribe((data: any) => {

          this.Propertys.set(data.PropertyValues)

        });
      }

    })

  }


  // دریافت داده‌ها از طریق HTTP یا محاسبه دیگر
  checkPropertyValueMap(textvalue: string) {
    for (const property of this.Propertys()) {

      if (property.PropertyValueMap === textvalue) {
        return true;
      }
    }
    return false;
  }



  getDisplayNamesdsd(textvalue: string): string {

    for (var property of this.Propertys()) {

      if (property.PropertyValueMap === textvalue) {
        // if (textvalue == "Nvarchar20") {
        //   this.parseXmlToJson(property.PropertySchema)

        // }

        //return property.DisplayName;
        return this.getDisplayName(property.PropertySchema);

      }
    }

    return "";

  }


  GetChoicesArray(textvalue: string) {


    for (var property of this.Propertys()) {

      if (property.PropertyValueMap === textvalue) {
        const xmlString = property.PropertySchema;
        const options = { compact: true };
        const jsonResult = convert.xml2json(xmlString, options);
        const parsedObject = JSON.parse(jsonResult);
        return parsedObject.Fields.CHOICES.CHOICE;

      }
    }

    return false;




  }


  trackChanges(value: any) {

    // همیشه وجود داشته باشن
    this.changedValues()['ObjectRef'] = this.ObjectRef;
    this.changedValues()['ClassName'] = "T" + this.ClassName;

    // Compare the current form values with the original values
    for (const key in value) {

      if (value.hasOwnProperty(key)) {

        if (value[key] !== this.originalValues[key]) {

          // مقدار تغییر کرده
          this.changedValues()[key] = value[key];

        } else if (key !== 'ObjectRef' && key !== 'ClassName') {

          // فقط بقیه فیلدها حذف بشن
          delete this.changedValues()[key];

        }

      }

    }

  }

  changedValues_show() {
    return Object.keys(this.changedValues()).length > 0
  }

  PropertyHasCHOICES(textvalue: string) {

    console.log(textvalue)

    for (var property of this.Propertys()) {

      if (property.PropertyValueMap === textvalue) {
        const xmlString = property.PropertySchema;
        console.log(xmlString)

        const options = { compact: true };
        const jsonResult = convert.xml2json(xmlString, options);
        const parsedObject = JSON.parse(jsonResult);
        return ('CHOICES' in parsedObject.Fields);

      }
    }

    return false;

  }


  parseXmlToJson(xml) {

    const xmlString = xml;
    const options = { compact: true };
    const jsonResult = convert.xml2json(xmlString, options);
    const parsedObject = JSON.parse(jsonResult);



  }


  getDisplayName(xml): string {
    const xmlString = xml;
    const options = { compact: true };
    const jsonResult = convert.xml2json(xmlString, options);
    const parsedObject = JSON.parse(jsonResult);

    return parsedObject.Fields.DisplayName._text;
  }


  changedValues_cansel_property() {



    this.EditForm_Property.patchValue({
      ObjectRef: this.EditForm_Property_temp.value.ObjectRef,
      ClassName: this.EditForm_Property_temp.value.ClassName,
      // GoodType: this.EditForm_Property_temp.value.GoodType,
      Nvarchar1: this.EditForm_Property_temp.value.Nvarchar1,
      Nvarchar2: this.EditForm_Property_temp.value.Nvarchar2,
      Nvarchar3: this.EditForm_Property_temp.value.Nvarchar3,
      Nvarchar4: this.EditForm_Property_temp.value.Nvarchar4,
      Nvarchar5: this.EditForm_Property_temp.value.Nvarchar5,
      Nvarchar6: this.EditForm_Property_temp.value.Nvarchar6,
      Nvarchar7: this.EditForm_Property_temp.value.Nvarchar7,
      Nvarchar8: this.EditForm_Property_temp.value.Nvarchar8,
      Nvarchar9: this.EditForm_Property_temp.value.Nvarchar9,
      Nvarchar10: this.EditForm_Property_temp.value.Nvarchar10,
      Nvarchar11: this.EditForm_Property_temp.value.Nvarchar11,
      Nvarchar12: this.EditForm_Property_temp.value.Nvarchar12,
      Nvarchar13: this.EditForm_Property_temp.value.Nvarchar13,
      Nvarchar14: this.EditForm_Property_temp.value.Nvarchar14,
      Nvarchar15: this.EditForm_Property_temp.value.Nvarchar15,
      Nvarchar16: this.EditForm_Property_temp.value.Nvarchar16,
      Nvarchar17: this.EditForm_Property_temp.value.Nvarchar17,
      Nvarchar18: this.EditForm_Property_temp.value.Nvarchar18,
      Nvarchar19: this.EditForm_Property_temp.value.Nvarchar19,
      Nvarchar20: this.EditForm_Property_temp.value.Nvarchar20,
      Int1: this.EditForm_Property_temp.value.Int1,
      Int2: this.EditForm_Property_temp.value.Int2,
      Int3: this.EditForm_Property_temp.value.Int3,
      Int4: this.EditForm_Property_temp.value.Int4,
      Int5: this.EditForm_Property_temp.value.Int5,
      Int6: this.EditForm_Property_temp.value.Int6,
      Int7: this.EditForm_Property_temp.value.Int7,
      Int8: this.EditForm_Property_temp.value.Int8,
      Int9: this.EditForm_Property_temp.value.Int9,
      Int10: this.EditForm_Property_temp.value.Int10,
      Float1: this.EditForm_Property_temp.value.Float1,
      Float2: this.EditForm_Property_temp.value.Float2,
      Float3: this.EditForm_Property_temp.value.Float3,
      Float4: this.EditForm_Property_temp.value.Float4,
      Float5: this.EditForm_Property_temp.value.Float5,
      Float6: this.EditForm_Property_temp.value.Float6,
      Float7: this.EditForm_Property_temp.value.Float7,
      Float8: this.EditForm_Property_temp.value.Float8,
      Float9: this.EditForm_Property_temp.value.Float9,
      Float10: this.EditForm_Property_temp.value.Float10,
      Text1: this.EditForm_Property_temp.value.Text1,
      Text2: this.EditForm_Property_temp.value.Text2,
      Text3: this.EditForm_Property_temp.value.Text3,
      Text4: this.EditForm_Property_temp.value.Text4,
      Text5: this.EditForm_Property_temp.value.Text5,
    });

    this.changedValues.set([])

  }


  submit(action) {


    if (action == 'property') {






      if (Object.keys(this.changedValues()).length > 0) {


        // this.ObjectToProperty.patchValue({
        //   ObjectRef: this.Code(),
        //   PropertyValue: JSON.parse(JSON.stringify(formGroup.value)),
        // });



        (this.KowsarTemplate.get("PropertyValue") as FormArray).clear();
        const formGroup = new FormGroup(
          Object.keys(this.changedValues()).reduce((acc, key) => {
            acc[key] = new FormControl(this.changedValues()[key]);
            return acc;
          }, {})
        );


        (this.KowsarTemplate.get("PropertyValue") as FormArray).push(formGroup);


        this.JsonForm.patchValue({
          JsonData: JSON.stringify(this.KowsarTemplate.value),
          TableName: this.ClassName
        });





        this.repo.PropertyValueCrudService(this.JsonForm.value).subscribe((data: any) => {


          const result = JSON.parse(data.PropertyValues[0].Result);

          if (result.PropertyValue && result.PropertyValue[0].ErrMessage === "") {
            this.notificationService.succeded();
            this.changedValues.set([])

            this.getDetails()
          } else {
            this.notificationService.error(result.PropertyValue[0].ErrMessage);
          }

        });


      } else {

      }


    }


  }

}
