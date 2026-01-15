import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { OrderWebApiService } from 'src/app/features/module/services/OrderWebApi.service';

@Component({
  selector: 'app-order-app-panel',
  templateUrl: './order-app-panel.component.html',
  standalone: true,
  imports: [
    CommonModule,
  ],
})
export class OrderAppPanelComponent implements OnInit {
  private readonly repo = inject(OrderWebApiService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  constructor() { }


  items1: any[] = [];
  items2: any[] = [];
  items3: any[] = [];
  items4: any[] = [];

  itemsAmount1: any[] = [];
  itemsAmount2: any[] = [];
  itemsAmount3: any[] = [];
  itemsAmount4: any[] = [];

  ItemsMax: any[] = [];
  ItemsMin: any[] = [];
  ItemsZero: any[] = [];

  ToDayDate: string = "";


  ngOnInit() {

    this.repo.GetTodeyFromServer("-1")
      .subscribe(e => {

        this.ToDayDate = e[0].TodeyFromServer
        this.Getemptymiz()
        this.GetAmountItem()
        this.GetOrderPanel()
      });


  }



  Getemptymiz() {

    this.repo.OrderMizList("3", "روف")
      .subscribe(e => {
        this.items1 = e;

      });


    this.repo.OrderMizList("3", "حیاط")
      .subscribe(e => {
        this.items2 = e;

      });


    this.repo.OrderMizList("3", "همایش")
      .subscribe(e => {
        this.items3 = e;

      });


    this.repo.OrderMizList("3", "تراس")
      .subscribe(e => {
        this.items4 = e;

      });


  }




  GetAmountItem() {

    this.repo.GetAmountItem(this.ToDayDate, "1")
      .subscribe(e => {
        this.itemsAmount1 = e;

      });


    this.repo.GetAmountItem(this.ToDayDate, "2")
      .subscribe(e => {
        this.itemsAmount2 = e;

      });


    this.repo.GetAmountItem(this.ToDayDate, "3")
      .subscribe(e => {
        this.itemsAmount3 = e;

      });


    this.repo.GetAmountItem(this.ToDayDate, "4")
      .subscribe(e => {
        this.itemsAmount4 = e;

      });


  }


  GetOrderPanel() {

    this.repo.GetOrderPanel(this.ToDayDate, this.ToDayDate, "1")
      .subscribe(e => {
        this.ItemsMax = e;

      });


    this.repo.GetOrderPanel(this.ToDayDate, this.ToDayDate, "2")
      .subscribe(e => {
        this.ItemsMin = e;

      });




  }















  ngAfterContentInit(): void {
    this.changeDetectorRef.detectChanges();
  }







}
