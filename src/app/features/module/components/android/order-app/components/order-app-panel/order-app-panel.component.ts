import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { KowsarBaseWebApi } from 'src/app/app-shell/framework-services/base/KowsarBaseWebApi.service';
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
  private readonly base_repo = inject(KowsarBaseWebApi);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  constructor() { }


  items1 = signal<any[]>([])
  items2 = signal<any[]>([])
  items3 = signal<any[]>([])
  items4 = signal<any[]>([])

  itemsAmount1 = signal<any[]>([])
  itemsAmount2 = signal<any[]>([])
  itemsAmount3 = signal<any[]>([])
  itemsAmount4 = signal<any[]>([])

  ItemsMax = signal<any[]>([])
  ItemsMin = signal<any[]>([])
  ItemsZero = signal<any[]>([])

  ToDayDate = signal('')


  ngOnInit() {


    this.base_repo.GetTodeyFromServer_Days("-1")
      .subscribe(e => {

        this.ToDayDate.set(e[0].TodeyFromServer)
        this.Getemptymiz()
        this.GetAmountItem()
        this.GetOrderPanel()
      });


  }



  Getemptymiz() {


    this.repo.OrderMizList("3", "روف")
      .subscribe(e => {
        this.items1.set(e)

      });



    this.repo.OrderMizList("3", "حیاط")
      .subscribe(e => {
        this.items2.set(e)

      });



    this.repo.OrderMizList("3", "همایش")
      .subscribe(e => {
        this.items3.set(e)

      });



    this.repo.OrderMizList("3", "تراس")
      .subscribe(e => {
        this.items4.set(e)

      });


  }




  GetAmountItem() {


    this.repo.GetAmountItem(this.ToDayDate(), "1")
      .subscribe(e => {
        this.itemsAmount1.set(e)

      });



    this.repo.GetAmountItem(this.ToDayDate(), "2")
      .subscribe(e => {
        this.itemsAmount2.set(e)

      });



    this.repo.GetAmountItem(this.ToDayDate(), "3")
      .subscribe(e => {
        this.itemsAmount3.set(e)

      });



    this.repo.GetAmountItem(this.ToDayDate(), "4")
      .subscribe(e => {
        this.itemsAmount4.set(e)

      });


  }


  GetOrderPanel() {


    this.repo.GetOrderPanel(this.ToDayDate(), this.ToDayDate(), "1")
      .subscribe(e => {
        this.ItemsMax.set(e)

      });



    this.repo.GetOrderPanel(this.ToDayDate(), this.ToDayDate(), "2")
      .subscribe(e => {
        this.ItemsMin.set(e)

      });




  }















  ngAfterContentInit(): void {
    this.changeDetectorRef.detectChanges();
  }







}
