import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';
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
  private readonly loadingService = inject(LoadingService);
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

    this.loadingService.show()
    this.repo.GetTodeyFromServer("-1")
      .subscribe(e => {

        this.ToDayDate = e[0].TodeyFromServer
        this.Getemptymiz()
        this.GetAmountItem()
        this.GetOrderPanel()
      });


  }



  Getemptymiz() {

    this.loadingService.show()
    this.repo.OrderMizList("3", "روف")
      .subscribe(e => {
        this.items1 = e;

      });


    this.loadingService.show()
    this.repo.OrderMizList("3", "حیاط")
      .subscribe(e => {
        this.items2 = e;

      });


    this.loadingService.show()
    this.repo.OrderMizList("3", "همایش")
      .subscribe(e => {
        this.items3 = e;

      });


    this.loadingService.show()
    this.repo.OrderMizList("3", "تراس")
      .subscribe(e => {
        this.items4 = e;

      });


  }




  GetAmountItem() {

    this.loadingService.show()
    this.repo.GetAmountItem(this.ToDayDate, "1")
      .subscribe(e => {
        this.itemsAmount1 = e;

      });


    this.loadingService.show()
    this.repo.GetAmountItem(this.ToDayDate, "2")
      .subscribe(e => {
        this.itemsAmount2 = e;

      });


    this.loadingService.show()
    this.repo.GetAmountItem(this.ToDayDate, "3")
      .subscribe(e => {
        this.itemsAmount3 = e;

      });


    this.loadingService.show()
    this.repo.GetAmountItem(this.ToDayDate, "4")
      .subscribe(e => {
        this.itemsAmount4 = e;

      });


  }


  GetOrderPanel() {

    this.loadingService.show()
    this.repo.GetOrderPanel(this.ToDayDate, this.ToDayDate, "1")
      .subscribe(e => {
        this.ItemsMax = e;

      });


    this.loadingService.show()
    this.repo.GetOrderPanel(this.ToDayDate, this.ToDayDate, "2")
      .subscribe(e => {
        this.ItemsMin = e;

      });




  }















  ngAfterContentInit(): void {
    this.changeDetectorRef.detectChanges();
  }







}
