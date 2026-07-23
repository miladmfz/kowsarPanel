import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  forkJoin,
  map,
  of,
  Subject,
  switchMap
} from 'rxjs';

import {
  ProductOnlineGroup,
  ProductOnlineItem
} from '../../models/product-online.models';
import { ProductOnlineApiService } from '../../services/product-online-api.service';
import { ProductOnlineConfigService } from '../../services/product-online-config.service';
import { ProductOnlineThemeService } from '../../services/product-online-theme.service';
import { ProductCardComponent } from '../product-card/product-card.component';

interface ProductLoadRequest {
  groupCode: string;
  searchTarget: string;
  forceReload: boolean;
}

interface ProductLoadResult {
  products: ProductOnlineItem[];
  errorMessage: string;
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent implements OnInit {
  private readonly api = inject(ProductOnlineApiService);
  private readonly productConfigService = inject(ProductOnlineConfigService);
  private readonly themeService = inject(ProductOnlineThemeService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  private readonly searchSubject = new Subject<string>();
  private readonly productLoadSubject = new Subject<ProductLoadRequest>();

  readonly config = this.productConfigService.settings;
  readonly groups = signal<ProductOnlineGroup[]>([]);
  readonly products = signal<ProductOnlineItem[]>([]);
  readonly selectedGroupCode = signal('');
  readonly defaultGroupCode = signal('');
  readonly searchTerm = signal('');
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly headerImageFailed = signal(false);

  readonly filteredProducts = computed<ProductOnlineItem[]>(() =>
    this.sortProducts([...this.products()])
  );

  readonly selectedGroupName = computed(() => {
    const selectedCode = this.selectedGroupCode();
    const selectedGroup = this.groups().find(
      group => String(group.GroupCode ?? '') === selectedCode
    );

    return String(selectedGroup?.Name ?? '').trim();
  });

  readonly showHeaderImage = computed(() =>
    this.config.ShowHeaderImage &&
    Boolean(this.config.HeaderImage) &&
    !this.headerImageFailed()
  );

  ngOnInit(): void {
    this.themeService.apply();
    this.initializeProductLoader();
    this.initializeSearch();
    this.loadInitialData();
  }

  onHeaderImageError(): void {
    this.headerImageFailed.set(true);
  }

  onSearchChange(value: string): void {
    const searchTarget = String(value ?? '');
    this.searchTerm.set(searchTarget);
    this.searchSubject.next(searchTarget);
  }

  selectGroup(group: ProductOnlineGroup): void {
    const groupCode = String(group.GroupCode ?? '').trim();

    if (!groupCode || groupCode === this.selectedGroupCode()) {
      return;
    }

    this.selectedGroupCode.set(groupCode);
    this.queueProductLoad(groupCode, this.searchTerm(), false);
  }

  openProduct(product: ProductOnlineItem): void {
    const goodCode = String(product.GoodCode ?? '').trim();

    if (!goodCode) {
      return;
    }

    this.router.navigate(
      ['../product-item', goodCode],
      { relativeTo: this.route }
    );
  }

  refresh(): void {
    const groupCode = this.selectedGroupCode() || this.defaultGroupCode();

    if (!groupCode) {
      this.loadInitialData();
      return;
    }

    this.queueProductLoad(groupCode, this.searchTerm(), true);
  }

  clearSearch(): void {
    this.searchTerm.set('');

    const groupCode = this.selectedGroupCode() || this.defaultGroupCode();

    if (groupCode) {
      this.queueProductLoad(groupCode, '', false);
    }
  }

  trackProduct(_: number, product: ProductOnlineItem): string {
    return String(product.GoodCode ?? '');
  }

  trackGroup(_: number, group: ProductOnlineGroup): string {
    return String(group.GroupCode ?? group.Name ?? '');
  }

  private initializeSearch(): void {
    this.searchSubject
      .pipe(
        debounceTime(450),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(searchTarget => {
        const groupCode = this.selectedGroupCode() || this.defaultGroupCode();

        if (groupCode) {
          this.queueProductLoad(groupCode, searchTarget, false);
        }
      });
  }

  private initializeProductLoader(): void {
    this.productLoadSubject
      .pipe(
        switchMap(request => {
          this.loading.set(true);
          this.errorMessage.set('');

          return this.api
            .getProducts(
              request.groupCode,
              request.searchTarget,
              request.forceReload
            )
            .pipe(
              map(products => ({
                products,
                errorMessage: ''
              } as ProductLoadResult)),
              catchError(error => {
                console.error('Product list error:', error);

                return of({
                  products: [],
                  errorMessage: 'دریافت فهرست کتاب‌ها انجام نشد.'
                } as ProductLoadResult);
              }),
              finalize(() => this.loading.set(false))
            );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(result => {
        this.products.set(result.products);
        this.errorMessage.set(result.errorMessage);
      });
  }

  private loadInitialData(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.api
      .getDefaultGroupCode()
      .pipe(
        switchMap(defaultGroupCode => {
          const normalizedCode = String(defaultGroupCode ?? '').trim();

          if (!normalizedCode) {
            throw new Error('Default product group code is empty.');
          }

          this.defaultGroupCode.set(normalizedCode);
          this.selectedGroupCode.set(normalizedCode);

          return forkJoin({
            groups: this.api.getGroups(normalizedCode),
            products: this.api.getProducts(normalizedCode, '', false)
          });
        }),
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: result => {
          const defaultCode = this.defaultGroupCode();
          const allGroup: ProductOnlineGroup = {
            GroupCode: defaultCode,
            Name: 'همه کتاب‌ها',
            ChildNo: '0'
          };

          const uniqueGroups = result.groups.filter(
            group => String(group.GroupCode ?? '') !== defaultCode
          );

          this.groups.set([allGroup, ...uniqueGroups]);
          this.products.set(result.products);
        },
        error: error => {
          console.error('Product initial data error:', error);
          this.groups.set([]);
          this.products.set([]);
          this.errorMessage.set('اطلاعات گروه‌ها و کتاب‌ها دریافت نشد.');
        }
      });
  }

  private queueProductLoad(
    groupCode: string,
    searchTarget: string,
    forceReload: boolean
  ): void {
    const normalizedGroupCode = String(groupCode ?? '').trim();

    if (!normalizedGroupCode) {
      this.products.set([]);
      return;
    }

    this.productLoadSubject.next({
      groupCode: normalizedGroupCode,
      searchTarget: String(searchTarget ?? '').trim(),
      forceReload
    });
  }

  private sortProducts(products: ProductOnlineItem[]): ProductOnlineItem[] {
    switch (this.config.SortMode) {
      case 'Name':
        return products.sort((first, second) =>
          String(first.GoodName ?? '').localeCompare(
            String(second.GoodName ?? ''),
            'fa'
          )
        );

      case 'PriceAsc':
        return products.sort((first, second) =>
          this.productPrice(first) - this.productPrice(second)
        );

      case 'PriceDesc':
        return products.sort((first, second) =>
          this.productPrice(second) - this.productPrice(first)
        );

      case 'Newest':
        return products.sort((first, second) =>
          Number(second.GoodCode || 0) - Number(first.GoodCode || 0)
        );

      default:
        return products;
    }
  }

  private productPrice(product: ProductOnlineItem): number {
    const price = Number(
      String(product.SellPrice || product.MaxSellPrice || '0')
        .replace(/,/g, '')
        .trim()
    );

    return Number.isFinite(price) ? price : 0;
  }
}
