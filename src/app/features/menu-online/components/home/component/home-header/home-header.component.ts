import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { AppConfigService } from 'src/app/app-config.service';


@Component({
  selector: 'app-home-header',
  templateUrl: './home-header.component.html',
  styleUrls: ['./home-header.component.css'],

  standalone: true,
  imports: [
    CommonModule
  ]
})
export class HomeHeaderComponent implements OnInit {

  readonly config =
    inject(AppConfigService);

  @Input()
  TitleName!: string;

  @Input()
  basketamount!: string;

  @Input()
  basketCount: number = 0;

  @Output()
  basketClicked =
    new EventEmitter<void>();

  mizname: string =
    'کافه کتاب ققنوس';

  ngOnInit(): void {

    if (!this.TitleName) {

      this.TitleName = 'Menu';
    }
  }

  OpenBasket(): void {

    this.basketClicked.emit();
  }

}