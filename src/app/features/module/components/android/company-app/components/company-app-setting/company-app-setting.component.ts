import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedService } from 'src/app/app-shell/framework-services/shared.service';
import { CompanyWebApiService } from 'src/app/features/module/services/CompanyWebApi.service';

@Component({
  selector: 'app-company-app-setting',
  templateUrl: './company-app-setting.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
  ],
})
export class CompanyAppSettingComponent implements OnInit {


  private readonly repo = inject(CompanyWebApiService);
  private readonly sharedService = inject(SharedService);

  constructor() { }




  items = signal<any[]>([])
  Printers = signal<any[]>([])
  BasketColumns = signal<any[]>([])
  AppBasketColumn_Status = signal('')
  Apptype = signal('0')
  selected_des = signal('')
  selected_value = signal('')
  selected_Key = signal('')


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
    this.Get_Base_data();

    this.CallService()
  }

  CallService() {
    this.sharedService.RefreshAllActions$.subscribe(action => {
      if (action === 'refresh') {
        this.refreshpage();
      }
    });
  }

  refreshpage() {
    this.Get_Base_data();
  }


  Get_Base_data() {

    this.repo.Web_GetDbsetupObject("Company").subscribe(e => {
      this.items.set(e)

    });

    this.repo.GetAppPrinter(this.Apptype()).subscribe(e => {
      this.Printers.set(e)

    });
    this.GetBasketColumnList();
  }




  CreateAppBasketColumn() {


    this.repo.CreateBasketColumn(this.Apptype()).subscribe(e => {
      this.AppBasketColumn_Status.set("AppBasketColumn created")
    });

  }




  SelectDbSetup(index: any) {
    this.selected_des = this.items[index].Description;
    this.selected_value = this.items[index].DataValue;
    this.selected_Key = this.items[index].KeyId;

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
        this.sharedService.triggerActionAll('refresh');
      });
    }
  }

  CreateprinterRecord() {
    this.EditForm_printer.reset();
  }



  UpdateDbSetup() {

    this.repo.UpdateDbSetup(this.selected_value(), this.selected_Key()).subscribe(e => {
      this.sharedService.triggerActionAll('refresh');
    });

  }



  GetBasketColumnList() {


    this.repo.GetBasketColumnList(this.Apptype()).subscribe(e => {
      this.BasketColumns.set(e)


    });


  }












}
