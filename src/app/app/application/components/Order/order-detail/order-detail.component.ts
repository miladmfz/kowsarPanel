import { Component, OnInit, ChangeDetectorRef, } from '@angular/core';
import { ApplicationWebApiService } from '../../../services/ApplicationWebApi.service';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
})
export class OrderDetailComponent implements OnInit {

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private repo: ApplicationWebApiService,
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

    this.repo.GetTodeyFromServer("-100").subscribe(e => {
      this.ToDayDate = e[0].TodeyFromServer;
      console.log(this.ToDayDate)
      this.Getemptymiz()
      this.GetAmountItem()
      this.minMaxGood()
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

      console.log(this.itemsAmount1[0].Amount)
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


  minMaxGood() {

    this.repo.minMaxGood(this.ToDayDate, "1").subscribe(e => {
      this.ItemsMax = e;

    });


    this.repo.minMaxGood(this.ToDayDate, "2").subscribe(e => {
      this.ItemsMin = e;

    });

    this.repo.minMaxGood(this.ToDayDate, "3").subscribe(e => {
      this.ItemsZero = e;

    });



  }















  ngAfterContentInit(): void {
    this.changeDetectorRef.detectChanges();
  }







}
