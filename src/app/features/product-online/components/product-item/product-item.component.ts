import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal
} from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  distinctUntilChanged,
  map,
  of,
  switchMap,
  tap
} from 'rxjs';

import {
  ProductDetailField,
  ProductOnlineItem
} from '../../models/product-online.models';
import { ProductOnlineApiService } from '../../services/product-online-api.service';
import { ProductOnlineConfigService } from '../../services/product-online-config.service';
import { ProductOnlineThemeService } from '../../services/product-online-theme.service';

interface ProductDescriptionSection {
  title: string;
  value: string;
  icon: string;
}

@Component({
  selector: 'app-product-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-item.component.html',
  styleUrls: ['./product-item.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductItemComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly api = inject(ProductOnlineApiService);
  private readonly productConfigService = inject(ProductOnlineConfigService);
  private readonly themeService = inject(ProductOnlineThemeService);
  private readonly destroyRef = inject(DestroyRef);

  readonly config = this.productConfigService.settings;
  readonly placeholderImage = this.api.placeholderImage;

  readonly product = signal<ProductOnlineItem | null>(null);
  readonly images = signal<string[]>([]);
  readonly selectedImage = signal(this.placeholderImage);
  readonly loading = signal(true);
  readonly imageLoading = signal(false);
  readonly errorMessage = signal('');
  readonly headerImageFailed = signal(false);

  readonly showHeaderImage = computed(() =>
    this.config.ShowHeaderImage &&
    Boolean(this.config.HeaderImage) &&
    !this.headerImageFailed()
  );

  readonly isFavorite = computed(() => {
    const value = String(this.product()?.IsFavorite ?? '')
      .trim()
      .toLowerCase();

    return value === '1' || value === 'true';
  });

  readonly specifications = computed<ProductDetailField[]>(() => {
    const product = this.product();

    if (!product) {
      return [];
    }

    const fields: ProductDetailField[] = [
      { label: 'کد کالا', value: this.text(product.GoodCode), icon: 'mdi-identifier' },
      { label: 'نوع کالا', value: this.text(product.GoodType), icon: 'mdi-shape-outline' },
      { label: 'شابک', value: this.text(product.ISBN), icon: 'mdi-barcode-scan' },
      { label: 'بارکد', value: this.text(product.Barcode), icon: 'mdi-barcode' },
      { label: 'نویسنده', value: this.text(product.Writer), icon: 'mdi-account-edit-outline' },
      { label: 'مترجم', value: this.text(product.DragoMan), icon: 'mdi-translate' },
      { label: 'ناشر', value: this.text(product.Nasher), icon: 'mdi-domain' },
      { label: 'سال چاپ', value: this.text(product.PrintYear), icon: 'mdi-calendar-outline' },
      { label: 'نوبت چاپ', value: this.text(product.PrintPeriod), icon: 'mdi-printer-outline' },
      { label: 'تعداد صفحات', value: this.text(product.PageNo), icon: 'mdi-book-open-page-variant-outline' },
      { label: 'قطع کتاب', value: this.text(product.Size), icon: 'mdi-resize' },
      { label: 'نوع جلد', value: this.text(product.CoverType), icon: 'mdi-book-outline' },
      { label: 'تاریخ تحویل', value: this.text(product.TahvilDate), icon: 'mdi-calendar-check-outline' },
      {
        label: 'گروه',
        value: this.text(product.GroupsWhitoutCode || product.BulletinGroupName),
        icon: 'mdi-bookshelf'
      },
      { label: 'کد اصلی', value: this.text(product.GoodMainCode), icon: 'mdi-file-tree-outline' },
      { label: 'کد فرعی', value: this.text(product.GoodSubCode), icon: 'mdi-source-branch' }
    ];

    return fields.filter(field => Boolean(field.value));
  });

  readonly descriptionSections = computed<ProductDescriptionSection[]>(() => {
    const product = this.product();

    if (!product) {
      return [];
    }

    const candidates: ProductDescriptionSection[] = [
      {
        title: 'معرفی کتاب',
        value: this.text(product.Details),
        icon: 'mdi-book-open-variant'
      },
      {
        title: 'توضیحات کتاب',
        value: this.text(product.GoodExplain2),
        icon: 'mdi-text-box-outline'
      },
      {
        title: 'توضیحات تکمیلی',
        value: this.text(product.Explain),
        icon: 'mdi-information-outline'
      }
    ];

    const excludedValues = new Set([
      this.normalizeText(product.GoodName),
      this.normalizeText(product.Nasher),
      this.normalizeText(product.Writer),
      this.normalizeText(product.DragoMan),
      this.normalizeText(product.GoodImageName)
    ].filter(Boolean));

    const seen = new Set<string>();

    return candidates.filter(section => {
      const normalizedValue = this.normalizeText(section.value);

      if (
        !normalizedValue ||
        seen.has(normalizedValue) ||
        excludedValues.has(normalizedValue) ||
        this.looksLikeImageFile(section.value)
      ) {
        return false;
      }

      seen.add(normalizedValue);
      return true;
    });
  });

  ngOnInit(): void {
    this.themeService.apply();
    this.listenToRoute();
  }

  onHeaderImageError(): void {
    this.headerImageFailed.set(true);
  }

  back(): void {
    if (window.history.length > 1) {
      this.location.back();
      return;
    }

    this.router.navigate(['/product/product-list']);
  }

  retry(): void {
    const goodCode = this.currentGoodCode();

    if (goodCode) {
      this.loadProduct(goodCode);
    }
  }

  chooseImage(image: string): void {
    const source = this.text(image);

    if (!source || source === this.selectedImage()) {
      return;
    }

    this.imageLoading.set(true);
    this.selectedImage.set(source);
  }

  onMainImageLoaded(): void {
    this.imageLoading.set(false);
  }

  onMainImageError(): void {
    this.imageLoading.set(false);
    this.selectedImage.set(this.placeholderImage);
  }

  onThumbnailError(event: Event): void {
    const image = event.target as HTMLImageElement;
    image.src = this.placeholderImage;
  }

  priceValue(): string {
    const product = this.product();

    if (!product || this.config.PriceMode === 'Hidden') {
      return '';
    }

    switch (this.config.PriceMode) {
      case 'SellPrice':
        return this.text(product.SellPrice || product.MaxSellPrice);

      case 'MaxSellPrice':
        return this.text(product.MaxSellPrice || product.SellPrice);

      default:
        return this.text(product.SellPrice || product.MaxSellPrice);
    }
  }

  formatPrice(value: string): string {
    const amount = Number(String(value ?? '').replace(/,/g, '').trim());

    return Number.isFinite(amount)
      ? Math.round(amount).toLocaleString('fa-IR')
      : this.text(value);
  }

  stockAmount(): number {
    const amount = Number(
      String(this.product()?.TotalAmount ?? '0')
        .replace(/,/g, '')
        .trim()
    );

    return Number.isFinite(amount) ? amount : 0;
  }

  stockText(): string {
    const amount = this.stockAmount();

    if (amount <= 0) {
      return 'ناموجود';
    }

    const displayAmount = Number.isInteger(amount)
      ? amount
      : Number(amount.toFixed(2));

    return `${displayAmount.toLocaleString('fa-IR')} عدد موجود`;
  }

  private listenToRoute(): void {
    this.route.paramMap
      .pipe(
        map(params => String(params.get('goodCode') ?? '').trim()),
        distinctUntilChanged(),
        tap(() => this.prepareForLoading()),
        switchMap(goodCode => {
          if (!goodCode) {
            this.errorMessage.set('کد کتاب معتبر نیست.');
            return of(null);
          }

          return this.api.getProductByCode(goodCode);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: product => this.handleProductResult(product),
        error: error => this.handleProductError(error)
      });
  }

  private loadProduct(goodCode: string): void {
    this.prepareForLoading();

    this.api
      .getProductByCode(goodCode)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: product => this.handleProductResult(product),
        error: error => this.handleProductError(error)
      });
  }

  private handleProductResult(product: ProductOnlineItem | null): void {
    this.loading.set(false);

    if (!product) {
      if (!this.errorMessage()) {
        this.errorMessage.set('اطلاعات این کتاب پیدا نشد.');
      }
      return;
    }

    this.product.set(product);
    this.errorMessage.set('');
    this.loadImages(product);
  }

  private handleProductError(error: unknown): void {
    console.error('Product detail error:', error);
    this.loading.set(false);
    this.imageLoading.set(false);
    this.errorMessage.set('دریافت اطلاعات کتاب انجام نشد.');
  }

  private loadImages(product: ProductOnlineItem): void {
    const goodCode = this.text(product.GoodCode);

    if (!this.config.ShowProductImage || !goodCode) {
      this.setFallbackImage();
      return;
    }

    this.imageLoading.set(true);

    this.api
      .getProductImages(goodCode, product.ImageCount)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: images => {
          const validImages = images
            .map(image => this.text(image))
            .filter(Boolean);

          if (validImages.length === 0) {
            this.setFallbackImage();
            return;
          }

          this.images.set(validImages);
          this.selectedImage.set(validImages[0]);
          this.imageLoading.set(false);
        },
        error: error => {
          console.error('Product images error:', error);
          this.setFallbackImage();
        }
      });
  }

  private prepareForLoading(): void {
    this.loading.set(true);
    this.imageLoading.set(false);
    this.errorMessage.set('');
    this.product.set(null);
    this.images.set([]);
    this.selectedImage.set(this.placeholderImage);
  }

  private setFallbackImage(): void {
    this.images.set([this.placeholderImage]);
    this.selectedImage.set(this.placeholderImage);
    this.imageLoading.set(false);
  }

  private currentGoodCode(): string {
    return String(
      this.route.snapshot.paramMap.get('goodCode') ?? ''
    ).trim();
  }

  private text(value: unknown): string {
    return value === null || value === undefined
      ? ''
      : String(value).trim();
  }

  private normalizeText(value: unknown): string {
    return this.text(value)
      .toLocaleLowerCase('fa-IR')
      .replace(/ي/g, 'ی')
      .replace(/ك/g, 'ک')
      .replace(/\s+/g, ' ');
  }

  private looksLikeImageFile(value: unknown): boolean {
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(this.text(value));
  }
}
