import { inject, Injectable } from '@angular/core';

import { AppConfigService } from 'src/app/app-config.service';

import {
  ProductOnlineConfig,
  ProductOnlineRuntimeConfig,
  ProductOnlineTheme
} from '../models/product-online.models';

const DEFAULT_PRODUCT_CONFIG: ProductOnlineConfig = {
  ShowGroupImage: false,
  ShowProductImage: true,
  ShowSubGroups: false,
  ShowQuickGroups: true,

  EnableSearch: true,
  EnableCategoryScroll: true,

  PriceMode: 'Default',
  SortMode: 'Default',

  ShowHeaderTitle: true,
  HeaderTitle: 'فهرست کتاب‌ها',

  ShowHeaderSubTitle: true,
  HeaderSubTitle: 'برای مشاهده مشخصات کامل، روی هر کتاب کلیک کنید.',

  ShowHeaderImage: true,
  HeaderImage: 'assets/images/product/product-header.svg',
  HeaderImageAlt: 'فهرست کتاب‌ها',

  ShowProductBadge: true,
  ProductBadgeField: 'GoodType',

  DefaultGroupKey: 'AppCustomer_DefaultGroupCode',

  ListImageScale: '300',
  DetailImageScale: '900',
  MaxGalleryImages: 8,

  ShowStock: true,
  ShowFavorite: true,
  ShowBookSpecifications: true
};

const DEFAULT_PRODUCT_THEME: ProductOnlineTheme = {
  background: '#F6F2EA',
  surface: '#FFFFFF',
  primary: '#6E482E',
  accent: '#B98542',
  text: '#2C241F',
  muted: '#776B62'
};

@Injectable({
  providedIn: 'root'
})
export class ProductOnlineConfigService {
  private readonly appConfig = inject(AppConfigService);

  private get runtimeConfig(): ProductOnlineRuntimeConfig {
    return this.appConfig as unknown as ProductOnlineRuntimeConfig;
  }

  get apiUrl(): string {
    return String(this.runtimeConfig.ProductapiUrl ?? '').trim();
  }

  get settings(): ProductOnlineConfig {
    return {
      ...DEFAULT_PRODUCT_CONFIG,
      ...(this.runtimeConfig.productConfig ?? {})
    };
  }

  get theme(): ProductOnlineTheme {
    return {
      ...DEFAULT_PRODUCT_THEME,
      ...(this.runtimeConfig.productTheme ?? {})
    };
  }
}
