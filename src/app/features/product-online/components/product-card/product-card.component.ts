import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  signal,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  ProductOnlineConfig,
  ProductOnlineItem
} from '../../models/product-online.models';
import { ProductOnlineApiService } from '../../services/product-online-api.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductCardComponent implements OnChanges {
  private readonly api = inject(ProductOnlineApiService);
  private readonly destroyRef = inject(DestroyRef);

  @Input({ required: true }) item!: ProductOnlineItem;
  @Input({ required: true }) config!: ProductOnlineConfig;

  @Output() readonly selected = new EventEmitter<ProductOnlineItem>();

  readonly imageSource = signal(this.api.placeholderImage);
  readonly imageLoading = signal(false);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['item'] || changes['config']) {
      this.loadImage();
    }
  }

  open(): void {
    this.selected.emit(this.item);
  }

  onImageLoaded(): void {
    this.imageLoading.set(false);
  }

  onImageError(): void {
    this.imageLoading.set(false);
    this.imageSource.set(this.api.placeholderImage);
  }

  badgeText(): string {
    if (!this.config?.ShowProductBadge) {
      return '';
    }

    const value = this.item?.[this.config.ProductBadgeField];
    return value === null || value === undefined
      ? ''
      : String(value).trim();
  }

  isFavorite(): boolean {
    const value = String(this.item?.IsFavorite ?? '')
      .trim()
      .toLowerCase();

    return value === '1' || value === 'true';
  }

  secondaryText(): string {
    return [this.item?.Writer, this.item?.Nasher]
      .map(value => String(value ?? '').trim())
      .filter(Boolean)
      .join(' • ');
  }

  priceValue(): string {
    if (!this.config) {
      return '';
    }

    switch (this.config.PriceMode) {
      case 'Hidden':
        return '';

      case 'SellPrice':
        return this.item?.SellPrice || this.item?.MaxSellPrice || '';

      case 'MaxSellPrice':
        return this.item?.MaxSellPrice || this.item?.SellPrice || '';

      default:
        return this.item?.SellPrice || this.item?.MaxSellPrice || '';
    }
  }

  formatPrice(value: string): string {
    const amount = Number(String(value ?? '').replace(/,/g, '').trim());

    return Number.isFinite(amount)
      ? Math.round(amount).toLocaleString('fa-IR')
      : String(value ?? '');
  }

  stockText(): string {
    const amount = this.stockAmount();

    if (amount <= 0) {
      return 'ناموجود';
    }

    const displayAmount = Number.isInteger(amount)
      ? amount
      : Number(amount.toFixed(2));

    return `${displayAmount.toLocaleString('fa-IR')} موجود`;
  }

  isAvailable(): boolean {
    return this.stockAmount() > 0;
  }

  private stockAmount(): number {
    const value = Number(
      String(this.item?.TotalAmount ?? '0')
        .replace(/,/g, '')
        .trim()
    );

    return Number.isFinite(value) ? value : 0;
  }

  private loadImage(): void {
    this.imageLoading.set(false);

    if (!this.config?.ShowProductImage || !this.item?.GoodCode) {
      this.imageSource.set(this.api.placeholderImage);
      return;
    }

    if (this.isUsableImage(this.item.Imageitem)) {
      this.imageSource.set(String(this.item.Imageitem));
      return;
    }

    this.imageLoading.set(true);

    this.api
      .getProductImage(
        this.item.GoodCode,
        0,
        this.config.ListImageScale
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: image => {
          this.imageSource.set(image);
          this.imageLoading.set(false);
        },
        error: () => {
          this.imageSource.set(this.api.placeholderImage);
          this.imageLoading.set(false);
        }
      });
  }

  private isUsableImage(value: unknown): boolean {
    const image = String(value ?? '').trim();

    return (
      image.startsWith('data:image/') ||
      image.startsWith('http://') ||
      image.startsWith('https://') ||
      image.startsWith('assets/')
    );
  }
}
