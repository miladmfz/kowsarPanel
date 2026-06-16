import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild
} from '@angular/core';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-single-item',
  templateUrl: './single-item.component.html',
  styleUrls: ['./single-item.component.css'],

  standalone: true,
  imports: [
    CommonModule
  ]
})
export class SingleItemComponent {

  @Input()
  item: any;

  @Input()
  menuConfig: any;

  @Output()
  itemSelected =
    new EventEmitter<any>();

  @Output()
  itemAdded =
    new EventEmitter<{
      item: any;
      imageElement: HTMLElement;
    }>();

  added: boolean = false;

  hovered: boolean = false;

  @ViewChild('productImage')
  productImage!: ElementRef<HTMLImageElement>;

  GetImageSrc(item: any): string {

    if (!this.menuConfig?.ShowProductImage) {
      return './assets/images/logo_color.png';
    }

    if (item.Imageitem && item.Imageitem.length > 100) {
      return item.Imageitem;
    }

    return './assets/images/logo_color.png';
  }

  ConvertToman(maxsellprice: string): string {

    if (!maxsellprice) {
      return '0';
    }

    let noLeadingZeros =
      maxsellprice.replace(/^0+/, '');

    if (noLeadingZeros.length > 4) {
      noLeadingZeros =
        noLeadingZeros.slice(0, -4);
    }

    return noLeadingZeros || '0';
  }

  SelectItem(): void {

    this.itemSelected.emit(this.item);
  }

  AddItem(event: MouseEvent): void {

    event.stopPropagation();

    this.added = true;

    this.itemAdded.emit({
      item: this.item,
      imageElement: this.productImage.nativeElement
    });

    setTimeout(() => {
      this.added = false;
    }, 900);
  }

}