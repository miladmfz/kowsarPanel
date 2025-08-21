import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder } from '@angular/forms';

import { Location } from '@angular/common';
import { OrderWebApiService } from '../../../services/OrderWebApi.service';
import { catchError, of } from 'rxjs';
import { NotificationService } from 'src/app/app-shell/framework-services/notification.service';

@Component({
  selector: 'app-order-column-edit',
  templateUrl: './order-column-edit.component.html',
})
export class OrderColumnEditComponent implements OnInit {

  constructor(
    private repo: OrderWebApiService,
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    private location: Location,
    private notificationService: NotificationService,
  ) { }


  AppType: string = "3";
  ColumnType: string = "0";
  Goodtypes: any[] = [];
  Goodtypes_str: string = "";
  TagName: string = "";

  Propertys: any[] = [];
  item: any;

  Lookup_item: any[] = [
    {
      Text: "غیر فعال", value: "-1"
    },
    {
      Text: "محاسباتی", value: "0"
    },
    {
      Text: "نمایش و جستجو", value: "9"
    },
    {
      Text: "فقط نمایش", value: "30"
    }
  ];


  selected_GoodType: any | null = null;
  selected_PropertyName: any | null = null;

  selected_ListLookup: any | null = null;
  selected_DetailLookup: any | null = null;
  selected_SearchLookup: any | null = null;


  selected_obj_Property: any | null = null;
  selected_obj_List: any | null = null;
  selected_obj_Detail: any | null = null;
  selected_obj_Search: any | null = null;




  ngOnInit() {

    this.TagName = "تعریف تنظیم جدول جدید"

    this.GetGoodType()




  }




  GetGoodType() {

    this.repo.GetGoodType()
      .subscribe(e => {
        this.Goodtypes = e;
        this.Goodtypes.unshift({ GoodType: "همه", IsDefault: -1 });
      });

  }





  selectGoodType() {


    if (this.selected_GoodType == "همه") {

      this.selected_GoodType = this.Goodtypes[1].GoodType
    }

    this.GetProperty()



  }

  GetProperty() {

    this.repo.GetProperty(this.selected_GoodType)
      .subscribe(e => {
        this.Propertys = e;

      });


  }


  selectproperty() {
    this.selected_obj_Property = this.Propertys.find(prop => prop.PropertyName === this.selected_PropertyName);

    const subString = this.selected_obj_Property.PropertyValueMap.substring(0, 3);



    if (subString == "Tex") {

      this.ColumnType = "0"
    } else if (subString == "Dat") {
      this.ColumnType = "0"
    } else if (subString == "Flo") {
      this.ColumnType = "2"
    } else if (subString == "Int") {
      this.ColumnType = "1"
    } else if (subString == "Nva") {
      this.ColumnType = "0"
    } else if (subString == "Bit") {
      this.ColumnType = "1"
    }





  }


  selectListlookup() {
    this.selected_obj_List = this.Lookup_item.find(prop => prop.Text === this.selected_ListLookup);

  }


  selectSearchlookup() {
    this.selected_obj_Search = this.Lookup_item.find(prop => prop.Text === this.selected_SearchLookup);

  }


  selectDetaillookup() {
    this.selected_obj_Detail = this.Lookup_item.find(prop => prop.Text === this.selected_DetailLookup);

  }







  getDisplayName(propertySchema: string): string {
    const matches = propertySchema.match(/<DisplayName>(.*?)<\/DisplayName>/);
    return matches ? matches[1] : "";
  }


  InsertSingleColumn() {

    this.repo.InsertSingleColumn(
      this.selected_obj_Property.PropertyValueMap
      , this.getDisplayName(this.selected_obj_Property.PropertySchema)
      , this.selected_GoodType
      , this.selected_obj_Detail.value
      , this.selected_obj_Detail.value
      , this.selected_obj_Detail.value
      , this.ColumnType
      , this.AppType)
      .pipe(
        catchError(error => {
          this.notificationService.error('مشکل در برقراری ارتباط', "خطا");
          return of(null); // یا هر مقدار جایگزین
        }))
      .subscribe(e => {
        this.location.back();
      });



  }

















}




