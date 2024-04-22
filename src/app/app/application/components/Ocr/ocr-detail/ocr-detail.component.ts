import { Component, OnInit } from '@angular/core';
import { ApplicationWebApiService, } from '../../../services/ApplicationWebApi.service';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder } from '@angular/forms';

@Component({
  selector: 'app-ocr-detail',
  templateUrl: './ocr-detail.component.html',
})
export class OcrDetailComponent implements OnInit {


  constructor(
    private repo: ApplicationWebApiService,
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder
  ) { }


  ListVisible_items: any[] = [];
  DetailVisible_items: any[] = [];
  SearchVisible_items: any[] = [];


  ngOnInit() {




  }









}
