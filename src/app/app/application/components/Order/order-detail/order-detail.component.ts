import { Component, OnInit, ChangeDetectorRef, } from '@angular/core';
import { OrderWebApiService } from '../../../services/OrderWebApi.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
})
export class OrderDetailComponent implements OnInit {

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private repo: OrderWebApiService,
  ) { }


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

    this.repo.GetTodeyFromServer("-1").subscribe(e => {

      this.ToDayDate = e[0].TodeyFromServer
      this.Getemptymiz()
      this.GetAmountItem()
      this.GetOrderPanel()
    });


  }



  Getemptymiz() {

    this.repo.OrderMizList("3", "روف").subscribe(e => {
      this.items1 = e;

    });


    this.repo.OrderMizList("3", "حیاط").subscribe(e => {
      this.items2 = e;

    });


    this.repo.OrderMizList("3", "همایش").subscribe(e => {
      this.items3 = e;

    });


    this.repo.OrderMizList("3", "تراس").subscribe(e => {
      this.items4 = e;

    });


  }




  GetAmountItem() {

    this.repo.GetAmountItem(this.ToDayDate, "1").subscribe(e => {
      this.itemsAmount1 = e;

    });


    this.repo.GetAmountItem(this.ToDayDate, "2").subscribe(e => {
      this.itemsAmount2 = e;

    });


    this.repo.GetAmountItem(this.ToDayDate, "3").subscribe(e => {
      this.itemsAmount3 = e;

    });


    this.repo.GetAmountItem(this.ToDayDate, "4").subscribe(e => {
      this.itemsAmount4 = e;

    });


  }


  GetOrderPanel() {

    this.repo.GetOrderPanel(this.ToDayDate, this.ToDayDate, "1").subscribe(e => {
      this.ItemsMax = e;

    });


    this.repo.GetOrderPanel(this.ToDayDate, this.ToDayDate, "2").subscribe(e => {
      this.ItemsMin = e;

    });




  }















  ngAfterContentInit(): void {
    this.changeDetectorRef.detectChanges();
  }







}
