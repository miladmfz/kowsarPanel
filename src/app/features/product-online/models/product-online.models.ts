export type ProductPriceMode =
  | 'Default'
  | 'SellPrice'
  | 'MaxSellPrice'
  | 'Hidden';

export type ProductSortMode =
  | 'Default'
  | 'Name'
  | 'PriceAsc'
  | 'PriceDesc'
  | 'Newest';

export interface ProductOnlineConfig {
  ShowGroupImage: boolean;
  ShowProductImage: boolean;
  ShowSubGroups: boolean;
  ShowQuickGroups: boolean;

  EnableSearch: boolean;
  EnableCategoryScroll: boolean;

  PriceMode: ProductPriceMode;
  SortMode: ProductSortMode;

  ShowHeaderTitle: boolean;
  HeaderTitle: string;

  ShowHeaderSubTitle: boolean;
  HeaderSubTitle: string;

  ShowHeaderImage: boolean;
  HeaderImage: string;
  HeaderImageAlt: string;

  ShowProductBadge: boolean;
  ProductBadgeField: string;

  DefaultGroupKey: string;

  ListImageScale: string;
  DetailImageScale: string;
  MaxGalleryImages: number;

  ShowStock: boolean;
  ShowFavorite: boolean;
  ShowBookSpecifications: boolean;
}

export interface ProductOnlineTheme {
  background: string;
  surface: string;
  primary: string;
  accent: string;
  text: string;
  muted: string;
}

export interface ProductOnlineRuntimeConfig {
  ProductapiUrl?: string;
  productConfig?: Partial<ProductOnlineConfig>;
  productTheme?: Partial<ProductOnlineTheme>;
}

export interface ProductOnlineGroup {
  GroupCode?: string;
  Name?: string;
  L1?: string | null;
  L2?: string | null;
  L3?: string | null;
  L4?: string | null;
  L5?: string | null;
  ChildNo?: string;
  Selected?: boolean;
  Imageitem?: string;
  [key: string]: unknown;
}

export interface ProductOnlineItem {
  rwn?: string;
  GoodCode: string;
  GoodName: string;
  GoodType?: string;
  MaxSellPrice?: string;
  SellPrice?: string;
  GoodMainCode?: string;
  GoodSubCode?: string;
  GoodExplain1?: string;
  GoodExplain2?: string;
  GoodExplain3?: string;
  GoodExplain4?: string;
  GoodExplain5?: string;
  GoodExplain6?: string;
  Explain?: string;
  Barcode?: string;
  ISBN?: string;
  ImageCount?: string;
  BulletinGroupName?: string;
  GroupsWhitoutCode?: string;
  HasStackAmount?: string;
  IsFavorite?: string;
  Nasher?: string;
  TahvilDate?: string;
  PrintPeriod?: string;
  PrintYear?: string;
  PageNo?: string;
  Size?: string;
  CoverType?: string;
  Details?: string;
  Writer?: string;
  DragoMan?: string;
  GoodImageName?: string;
  BasketAmount?: string;
  TotalAmount?: string;
  PrivateCodeForSort?: string;
  Imageitem?: string;
  [key: string]: unknown;
}

export interface ProductOnlineGroupsResponse {
  Groups?: ProductOnlineGroup[];
}

export interface ProductOnlineItemsResponse {
  Goods?: ProductOnlineItem[];
  Products?: ProductOnlineItem[];
}

export interface ProductOnlineTextResponse {
  Text?: string;
}

export interface ProductDetailField {
  label: string;
  value: string;
  icon: string;
}
