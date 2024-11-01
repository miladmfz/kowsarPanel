import { Component, OnInit } from '@angular/core';
import { OcrWebApiService } from '../../../services/OcrWebApi.service';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-ocr-setting',
  templateUrl: './ocr-setting.component.html',
})
export class OcrSettingComponent implements OnInit {

  constructor(private repo: OcrWebApiService,) { }
  items: any = [];
  Printers: any = [];
  BasketColumns: any = [];
  AppBasketColumn_Status: string = '';
  Apptype: string = '2';
  selected_des: string = "";
  selected_value: string = "";
  selected_Key: string = "";

  EditForm_printer = new FormGroup({
    AppPrinterCode: new FormControl(''),
    PrinterName: new FormControl(''),
    PrinterExplain: new FormControl(''),
    GoodGroups: new FormControl(''),
    WhereClause: new FormControl(''),
    PrintCount: new FormControl(''),
    PrinterActive: new FormControl(''),
    FilePath: new FormControl(''),
  });


  ngOnInit() {
    this.repo.Web_GetDbsetupObject("Ocrkowsar").subscribe(e => {
      this.items = e;

    });
    this.repo.GetAppPrinter(this.Apptype).subscribe(e => {
      this.Printers = e;

    });
    this.GetBasketColumnList();
  }

  CreateAppBasketColumn() {

    this.repo.CreateBasketColumn(this.Apptype).subscribe(e => {
      this.AppBasketColumn_Status = "AppBasketColumn created";
    });

  }

  SelectDbSetup(index: any) {
    this.selected_des = this.items[index].Description;
    this.selected_value = this.items[index].DataValue;
    this.selected_Key = this.items[index].KeyId;

  }


  UpdateDbSetup() {
    this.repo.UpdateDbSetup(this.selected_value, this.selected_Key).subscribe(e => {
      location.reload();
    });

  }



  SelectPrinter(index: any) {
    this.EditForm_printer.patchValue({
      AppPrinterCode: this.Printers[index].AppPrinterCode,
      PrinterName: this.Printers[index].PrinterName,
      PrinterExplain: this.Printers[index].PrinterExplain,
      GoodGroups: this.Printers[index].GoodGroups,
      WhereClause: this.Printers[index].WhereClause,
      PrintCount: this.Printers[index].PrintCount,
      PrinterActive: this.Printers[index].PrinterActive,
      FilePath: this.Printers[index].FilePath,
    });
  }

  Updateprinter() {

    const command = this.EditForm_printer.value
    if (this.EditForm_printer.value.PrinterName !== "") {
      this.repo.UpdatePrinter(command).subscribe(e => {
        location.reload();
      });
    }
  }

  CreateprinterRecord() {
    this.EditForm_printer.reset();
  }


  GetBasketColumnList() {

    this.repo.GetBasketColumnList(this.Apptype).subscribe(e => {
      this.BasketColumns = e;


    });

  }



















}


