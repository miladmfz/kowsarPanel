import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  catchError,
  forkJoin,
  map,
  Observable,
  of,
  shareReplay,
  tap
} from 'rxjs';

import { HeaderService } from 'src/app/app-shell/framework-services/HeaderService';

import {
  ProductOnlineGroup,
  ProductOnlineItem
} from '../models/product-online.models';
import { ProductOnlineConfigService } from './product-online-config.service';

@Injectable({
  providedIn: 'root'
})
export class ProductOnlineApiService {
  private readonly client = inject(HttpClient);
  private readonly headerService = inject(HeaderService);
  private readonly productConfig = inject(ProductOnlineConfigService);

  private readonly groupProductsCache = new Map<string, ProductOnlineItem[]>();
  private readonly imageCache = new Map<string, Observable<string>>();

  private readonly tags = {
    info: 'kowsar_info',
    groups: 'GoodGroupInfo',
    list: 'goodinfo',
    image: 'getImage'
  } as const;





  getDefaultGroupCode(): Observable<string> {
    const params = new HttpParams()
      .set('Where', this.productConfig.settings.DefaultGroupKey);

    return this.client
      .get<unknown>(this.url(this.tags.info), {
        headers: this.headerService.headers,
        params
      })
      .pipe(
        map(response => this.extractText(response)),
        map(value => value.trim())
      );
  }

  getGroups(parentGroupCode: string): Observable<ProductOnlineGroup[]> {
    const params = new HttpParams()
      .set('GroupCode', String(parentGroupCode ?? '').trim());

    return this.client
      .get<unknown>(this.url(this.tags.groups), {
        headers: this.headerService.headers,
        params
      })
      .pipe(
        map(response => this.extractGroups(response)),
        map(groups => groups.map(group => this.normalizeGroup(group)))
      );
  }

  getProducts(
    groupCode: string,
    searchTarget: string = '',
    forceReload = false
  ): Observable<ProductOnlineItem[]> {
    const normalizedGroupCode = String(groupCode ?? '').trim();
    const normalizedSearchTarget = String(searchTarget ?? '').trim();
    const cacheKey = `${normalizedGroupCode}|${normalizedSearchTarget}`;
    const cached = this.groupProductsCache.get(cacheKey);

    if (cached && !forceReload) {
      return of(cached.map(item => ({ ...item })));
    }

    const params = new HttpParams()
      .set('GroupCode', normalizedGroupCode)
      .set('SearchTarget', normalizedSearchTarget)
      .set('AppType', '0');

    return this.client
      .get<unknown>(this.url(this.tags.list), {
        headers: this.headerService.headers,
        params
      })
      .pipe(
        map(response => this.extractProducts(response)),
        map(products => products.map(product => this.normalizeProduct(product))),
        tap(products => this.groupProductsCache.set(cacheKey, products)),
        map(products => products.map(product => ({ ...product })))
      );
  }

  getProductByCode(goodCode: string): Observable<ProductOnlineItem | null> {
    const normalizedGoodCode = String(goodCode ?? '').trim();

    if (!normalizedGoodCode) {
      return of(null);
    }

    const params = new HttpParams()
      .set('GoodCode', normalizedGoodCode)
      .set('SearchTarget', '')
      .set('AppType', '0');

    return this.client
      .get<unknown>(this.url(this.tags.list), {
        headers: this.headerService.headers,
        params
      })
      .pipe(
        map(response => this.extractProducts(response)),
        map(products => products.map(product => this.normalizeProduct(product))),
        map(products =>
          products.find(product => product.GoodCode === normalizedGoodCode) ??
          products[0] ??
          null
        )
      );
  }

  getProductImage(
    goodCode: string,
    imageIndex = 0,
    scale?: string
  ): Observable<string> {
    const normalizedCode = String(goodCode ?? '').trim();

    if (!normalizedCode) {
      return of(this.placeholderImage);
    }

    const normalizedScale = String(
      scale ?? this.productConfig.settings.ListImageScale
    ).trim();

    const cacheKey = `${normalizedCode}|${imageIndex}|${normalizedScale}`;
    const cached = this.imageCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    const params = new HttpParams()
      .set('ClassName', 'TGood')
      .set('IX', String(imageIndex))
      .set('Scale', normalizedScale)
      .set('ObjectRef', normalizedCode);

    const request$ = this.client
      .get<unknown>(this.url(this.tags.image), {
        headers: this.headerService.headers,
        params
      })
      .pipe(
        map(response => this.extractText(response)),
        map(image => this.toImageSource(image)),
        catchError(() => of(this.placeholderImage)),
        shareReplay({ bufferSize: 1, refCount: false })
      );

    this.imageCache.set(cacheKey, request$);
    return request$;
  }

  getProductImages(
    goodCode: string,
    imageCount: string | number | undefined
  ): Observable<string[]> {
    const requestedCount = Math.max(1, Number(imageCount) || 1);
    const maxGalleryImages = Math.max(
      1,
      Number(this.productConfig.settings.MaxGalleryImages) || 1
    );
    const count = Math.min(requestedCount, maxGalleryImages);

    const requests = Array.from({ length: count }, (_, index) =>
      this.getProductImage(
        goodCode,
        index,
        this.productConfig.settings.DetailImageScale
      )
    );

    return forkJoin(requests).pipe(
      map(images => {
        const validImages = images.filter((image, index, array) =>
          image !== this.placeholderImage && array.indexOf(image) === index
        );

        return validImages.length > 0
          ? validImages
          : [this.placeholderImage];
      }),
      catchError(() => of([this.placeholderImage]))
    );
  }

  clearProductCache(): void {
    this.groupProductsCache.clear();
  }

  clearImageCache(): void {
    this.imageCache.clear();
  }

  get placeholderImage(): string {
    return 'assets/images/book-placeholder.svg';
  }

  private url(tag: string): string {
    const baseUrl = this.productConfig.apiUrl;

    if (!baseUrl) {
      throw new Error('ProductapiUrl is empty in app config.');
    }

    return `${baseUrl}${tag}`;
  }

  private normalizeGroup(group: ProductOnlineGroup): ProductOnlineGroup {
    const source = group as Record<string, unknown>;

    return {
      ...group,
      GroupCode: this.pickString(
        source,
        'GroupCode',
        'groupCode',
        'GoodGroupCode',
        'goodGroupCode'
      ),
      Name: this.pickString(
        source,
        'Name',
        'name',
        'GroupName',
        'groupName',
        'GoodGroupName',
        'goodGroupName'
      ),
      ChildNo: this.pickString(source, 'ChildNo', 'childNo'),
      Imageitem: this.pickString(source, 'Imageitem', 'ImageItem', 'imageitem')
    };
  }

  private normalizeProduct(product: ProductOnlineItem): ProductOnlineItem {
    const source = product as Record<string, unknown>;

    const normalized: ProductOnlineItem = {
      ...product,
      GoodCode: this.pickString(source, 'GoodCode', 'goodCode'),
      GoodName: this.pickString(source, 'GoodName', 'goodName')
    };

    const fields = [
      'rwn',
      'GoodType',
      'MaxSellPrice',
      'SellPrice',
      'GoodMainCode',
      'GoodSubCode',
      'GoodExplain1',
      'GoodExplain2',
      'GoodExplain3',
      'GoodExplain4',
      'GoodExplain5',
      'GoodExplain6',
      'Explain',
      'Barcode',
      'ISBN',
      'ImageCount',
      'BulletinGroupName',
      'GroupsWhitoutCode',
      'HasStackAmount',
      'IsFavorite',
      'Nasher',
      'TahvilDate',
      'PrintPeriod',
      'PrintYear',
      'PageNo',
      'Size',
      'CoverType',
      'Details',
      'Writer',
      'DragoMan',
      'GoodImageName',
      'BasketAmount',
      'TotalAmount',
      'PrivateCodeForSort',
      'Imageitem'
    ] as const;

    for (const field of fields) {
      normalized[field] = this.toStringValue(source[field]);
    }

    return normalized;
  }

  private extractGroups(response: unknown): ProductOnlineGroup[] {
    if (Array.isArray(response)) {
      return response as ProductOnlineGroup[];
    }

    const record = this.asRecord(response);
    const value =
      record['Groups'] ??
      record['groups'] ??
      record['GoodGroups'] ??
      record['goodGroups'] ??
      record['Data'] ??
      record['data'];

    return Array.isArray(value)
      ? value as ProductOnlineGroup[]
      : [];
  }

  private extractProducts(response: unknown): ProductOnlineItem[] {
    if (Array.isArray(response)) {
      return response as ProductOnlineItem[];
    }

    const record = this.asRecord(response);
    const value =
      record['Goods'] ??
      record['goods'] ??
      record['Products'] ??
      record['products'] ??
      record['Data'] ??
      record['data'];

    if (Array.isArray(value)) {
      return value as ProductOnlineItem[];
    }

    if (record['GoodCode'] || record['goodCode']) {
      return [record as unknown as ProductOnlineItem];
    }

    return [];
  }

  private extractText(response: unknown): string {
    if (response === null || response === undefined) {
      return '';
    }

    if (typeof response === 'string') {
      return response.trim();
    }

    if (Array.isArray(response)) {
      return response.length > 0
        ? this.extractText(response[0])
        : '';
    }

    const record = this.asRecord(response);

    return this.toStringValue(
      record['Text'] ??
      record['text'] ??
      record['Value'] ??
      record['value'] ??
      record['DataValue']
    );
  }

  private toImageSource(value: string): string {
    const image = String(value ?? '').trim();

    if (!image) {
      return this.placeholderImage;
    }

    if (
      image.startsWith('data:image/') ||
      image.startsWith('http://') ||
      image.startsWith('https://') ||
      image.startsWith('assets/')
    ) {
      return image;
    }

    return `data:image/jpeg;base64,${image}`;
  }

  private pickString(
    source: Record<string, unknown>,
    ...keys: string[]
  ): string {
    for (const key of keys) {
      const value = this.toStringValue(source[key]);

      if (value) {
        return value;
      }
    }

    return '';
  }

  private asRecord(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object'
      ? value as Record<string, unknown>
      : {};
  }

  private toStringValue(value: unknown): string {
    return value === null || value === undefined
      ? ''
      : String(value).trim();
  }
}
