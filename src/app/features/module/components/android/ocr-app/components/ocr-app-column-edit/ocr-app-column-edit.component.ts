import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OcrWebApiService } from 'src/app/features/module/services/OcrWebApi.service';
import { Location } from '@angular/common';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';

@Component({
  selector: 'app-ocr-app-column-edit',
  templateUrl: './ocr-app-column-edit.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    FormsModule
  ],
})
export class OcrAppColumnEditComponent implements OnInit {


  private readonly repo = inject(OcrWebApiService);
  private readonly location = inject(Location);

  constructor() { }


  AppType: string = "2";
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


    this.repo.GetGoodType().subscribe(e => {
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


    this.repo.GetProperty(this.selected_GoodType).subscribe(e => {
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
      , this.AppType
    ).subscribe(e => {
      this.location.back();
    });



  }

















}




