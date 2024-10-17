import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder } from '@angular/forms';
import { OcrWebApiService } from '../../../services/OcrWebApi.service';

@Component({
  selector: 'app-ocr-detail',
  templateUrl: './ocr-detail.component.html',
})
export class OcrDetailComponent implements OnInit {


  constructor(
    private repo: OcrWebApiService,
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder
  ) { }


  ListVisible_items: any[] = [];
  DetailVisible_items: any[] = [];
  SearchVisible_items: any[] = [];


  ngOnInit() {




  }









}
