import { Component, OnInit, AfterViewInit } from '@angular/core';
import { initialTheme } from '../../../assets/js/app.min.js';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
})
export class LayoutComponent implements OnInit, AfterViewInit {
  constructor() { }
  ngAfterViewInit(): void {
    initialTheme();
  }
  ngOnInit() { }
}
