import {
  ChangeDetectionStrategy, Component, DestroyRef, ElementRef, HostListener, ViewChild, inject, OnInit, computed, signal
} from '@angular/core';
import { CommonModule, Location } from '@angular/common';

import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Good } from '../../models/Good';
import { TextValue } from '../../models/textvalue';
import { BasketInfo } from '../../models/BasketInfo';
import { Group } from '../../models/group';

import { OrderRepoService } from '../../services/order-repo.service';

import { HomeHeaderComponent } from '../home/component/home-header/home-header.component';
import { SingleGroupComponent } from './component/single-group/single-group.component';
import { SingleItemComponent } from './component/single-item/single-item.component';
import { AppConfigService } from 'src/app/app-config.service';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import { HeaderService } from 'src/app/app-shell/framework-services/HeaderService';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],

  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HomeHeaderComponent,
    SingleGroupComponent,
    SingleItemComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuComponent implements OnInit {

  private readonly repo = inject(OrderRepoService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly location = inject(Location);
  public readonly config = inject(AppConfigService);
  protected readonly session = inject(SessionStorageService);
  @ViewChild('productScrollContainer') productScrollContainer!: ElementRef<HTMLDivElement>;

  Goods = signal<Good[]>([]);

  AllGoods = signal<Good[]>([]);

  BasketGoods = signal<any[]>([]);
  showRemoveConfirm = signal<any>(null);
  Groups = signal<Group[]>([]);

  BasketInfo = signal<BasketInfo[]>([]);

  TextValue = signal<TextValue | null>(null);

  basketsum = signal<string>('');

  mizname = signal<string>('');

  searchTerm = signal<string>('');

  loading = signal<boolean>(false);

  isDesktop = signal<boolean>(true);

  selectedItem = signal<any>(null);

  selectedGroupCode = signal<string>('');

  basketOpen = signal<boolean>(false);

  filteredGoods =
    computed(() => {

      const search =
        this.searchTerm().trim();

      if (!search) {
        return this.Goods();
      }

      this.session.setItem('DefaultGroupCode', this.session.getString('DefaultGroupCodeAll') ?? '');

      return this.AllGoods().filter(item =>
        item.GoodName?.includes(search) ||
        item.GoodCode?.includes(search) ||
        item.GoodExplain1?.includes(search) ||
        item.GoodExplain2?.includes(search)
      );
    });

  filteredGoodsWithGroup =
    computed(() => {

      let previousGroup = '';

      return this.filteredGoods().map(item => {

        const currentGroup =
          this.NormalizeGroupName(
            item.GoodExplain1 ?? ''
          );

        const matchedGroup =
          this.Groups().find(group =>
            this.NormalizeGroupName(group.Name ?? '') === currentGroup
          );

        const showGroupTitle =
          currentGroup !== previousGroup;

        previousGroup =
          currentGroup;

        return {
          item,
          groupTitle: currentGroup,
          groupCode: matchedGroup?.GroupCode ?? '',
          showGroupTitle
        };
      });
    });

  basketTotalAmount =
    computed(() => {

      return this.BasketGoods().reduce(
        (sum, item) =>
          sum + (+item.Amount || 0),
        0
      );
    });

  basketTotalPrice =
    computed(() => {

      return this.BasketGoods().reduce(
        (sum, item) =>
          sum + ((+item.Price || 0) * (+item.Amount || 0)),
        0
      );
    });

  ngOnInit(): void {

    this.session.setItem('RstmizCode', '41');
    this.session.setItem('ShowDialog', '0');
    this.ApplyMenuTheme();

    this.isDesktop.set(
      this.checkIfDesktop()
    );

    this.LoadMenuData();
  }

  LoadMenuData(): void {

    this.loading.set(true);

    this.repo.GetRstMizData(
      this.session.getString('RstmizCode')
    )
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (res: any[]) => {

          this.BasketInfo.set(
            Array.isArray(res) ? res : []
          );

          this.mizname.set(
            this.session.getString('RstMizName') ?? ''
          );

          const info =
            this.BasketInfo()[0];

          if (
            info?.InfoState === '0' ||
            info?.InfoState === '3'
          ) {
            this.CreateOrderInfo();
          }
          else {
            this.LoadGroupsAndGoods();
          }
        },
        error: () => {
          this.loading.set(false);
        }
      });
  }

  CreateOrderInfo(): void {

    const info =
      this.BasketInfo()[0];

    this.repo.OrderInfoInsert(
      info.RstmizCode!,
      info.Today!
    )
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (res: any[]) => {

          this.BasketInfo.set(
            Array.isArray(res) ? res : []
          );

          this.LoadGroupsAndGoods();
        },
        error: () => {
          this.loading.set(false);
        }
      });
  }

  LoadGroupsAndGoods(): void {

    this.repo.GetGroupCode()
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (res: any) => {

          this.TextValue.set(res);

          this.repo.getGroupsByCode(res.Text!)
            .pipe(
              takeUntilDestroyed(this.destroyRef)
            )
            .subscribe({
              next: (groupRes: any) => {

                const groups: Group[] =
                  Array.isArray(groupRes?.Groups)
                    ? groupRes.Groups
                    : [];

                this.SetSessionInfo();

                const newItem: Group = {

                  GroupCode:
                    this.session.getString('DefaultGroupCodeAll') ?? '',

                  Name: 'همه',

                  Imageitem: '',

                  L1: null,
                  L2: null,
                  L3: null,
                  L4: null,
                  L5: null,

                  ChildNo: '0',

                  Selected: false
                };

                this.Groups.set([
                  newItem,
                  ...groups
                ]);

                this.GetGoods();
                this.GetAllGoods();
                this.OrderGetSummmary();
                this.GetBasketGoods();
              },
              error: () => {
                this.loading.set(false);
              }
            });
        },
        error: () => {
          this.loading.set(false);
        }
      });
  }

  SetSessionInfo(): void {

    const info =
      this.BasketInfo()[0];

    const textValue =
      this.TextValue();

    this.session.setItem('Today', info?.Today ?? '');
    this.session.setItem('RstmizCode', info?.RstmizCode ?? '');
    this.session.setItem('RstMizName', info?.RstMizName ?? '');
    this.session.setItem('AppBasketInfoCode', info?.AppBasketInfoCode ?? '');
    this.session.setItem('DefaultGroupCode', textValue?.Text ?? '');
    this.session.setItem('DefaultGroupCodeAll', textValue?.Text ?? '');

    this.selectedGroupCode.set(
      textValue?.Text ?? ''
    );
  }

  GetGoods(): void {

    this.loading.set(true);

    this.Goods.set([]);

    this.repo.GetMenuGoodList(
      this.session.getString('DefaultGroupCode'),
      this.session.getString('AppBasketInfoCode')
    )
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (res: any) => {

          const goods =
            Array.isArray(res?.Goods)
              ? res.Goods
              : [];

          this.Goods.set(goods);
          this.LoadMissingImages(goods);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        }
      });
  }

  GetAllGoods(): void {

    this.repo.getAllGood(
      this.session.getString('DefaultGroupCodeAll'),
      this.session.getString('AppBasketInfoCode')
    )
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (res: any) => {

          const goods =
            Array.isArray(res?.Goods)
              ? res.Goods
              : [];

          this.AllGoods.set(goods);
          this.LoadMissingImages(goods);
        }
      });
  }
  LoadMissingBasketImages(goods: any[]): void {

    goods.forEach(item => {

      if (!item.Imageitem || item.Imageitem.length <= 0) {

        this.repo.GetImage(item.GoodCode + '')
          .pipe(
            takeUntilDestroyed(this.destroyRef)
          )
          .subscribe({
            next: (data: any) => {

              if (!data?.Text) {
                return;
              }

              item.Imageitem =
                `data:image/jpeg;base64,${data.Text}`;

              this.BasketGoods.update(items => [...items]);
            }
          });
      }
    });
  }
  GetBasketGoods(): void {

    this.repo.GetBasketOrder(
      this.session.getString('AppBasketInfoCode')
    )
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (res: any) => {

          const goods =
            Array.isArray(res?.Goods)
              ? res.Goods
              : [];

          this.BasketGoods.set(goods);

          this.LoadMissingBasketImages(goods);
        }
      });
  }
  OrderGetSummmary(): void {

    this.repo.OrderGetSummmary(
      this.session.getString('AppBasketInfoCode')
    )
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (res: any) => {

          if (!res?.Goods) {
            this.basketsum.set('');
          }
          else {
            this.basketsum.set(
              res.Goods[0].SumFacAmount ?? ''
            );
          }
        }
      });
  }

  RefreshMenu(flag: boolean): void {

    if (!flag) {
      return;
    }

    this.searchTerm.set('');

    this.GetGoods();
    this.GetBasketGoods();
    this.OrderGetSummmary();
  }

  AddToBasket(data: any): void {

    const item =
      data.item;

    const imageElement =
      data.imageElement;

    const basket = [...this.BasketGoods()];

    const found = basket.find(x =>
      x.GoodCode === item.GoodCode
    );

    if (found) {
      found.Amount =
        (+found.Amount || 0) + 1;
    }
    else {
      basket.push({
        ...item,
        Amount: 1,
        Price: item.MaxSellPrice
      });
    }

    this.BasketGoods.set(basket);

    if (this.config.menuConfig.EnableAddToast) {
      this.ShowAddToast(item);
    }

    if (this.config.menuConfig.EnableAddSound) {
      this.PlayAddSound();
    }

    if (this.config.menuConfig.EnableBasketPulse) {
      this.TriggerBasketPulse();
    }

    if (this.config.menuConfig.EnableFlyToBasket) {
      this.StartFlyAnimation(imageElement);
    }
  }

  IncreaseBasketItem(item: any): void {

    if (+item.Amount >= 10) {
      return;
    }

    const newAmount =
      (+item.Amount + 1).toString();

    this.repo.OrderRowInsert(
      item,
      newAmount,
      item.Explain ?? '',
      this.session.getString('AppBasketInfoCode') ?? ''
    )
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {

          this.GetBasketGoods();
          this.OrderGetSummmary();
        }
      });
  }
  ConfirmRemoveBasketItem(): void {

    const item =
      this.showRemoveConfirm();

    if (!item) {
      return;
    }

    this.RemoveBasketItem(item);

    this.showRemoveConfirm.set(null);
  }
  CancelRemoveBasketItem(): void {

    this.showRemoveConfirm.set(null);
  }
  DecreaseBasketItem(item: any): void {

    if (+item.Amount <= 1) {

      this.showRemoveConfirm.set(item);

      return;
    }

    const newAmount =
      (+item.Amount - 1).toString();

    this.repo.OrderRowInsert(
      item,
      newAmount,
      item.Explain ?? '',
      this.session.getString('AppBasketInfoCode') ?? ''
    )
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {

          this.GetBasketGoods();

          this.OrderGetSummmary();
        }
      });
  }

  RemoveBasketItem(item: any): void {

    this.repo.OrderRowDelete(
      item,
      this.session.getString('AppBasketInfoCode') ?? ''
    )
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {

          this.GetBasketGoods();
          this.OrderGetSummmary();
        }
      });
  }

  OpenBasket(): void {

    this.basketOpen.set(true);
  }

  CloseBasket(): void {

    this.basketOpen.set(false);
  }

  OrderToFactor(): void {

    console.log('Order To Factor');

    const audio = new Audio(
      'assets/sounds/order-success.m4a'
    );

    audio.volume = 1;

    audio.play();
  }

  ClearBasket(): void {

    const items =
      this.BasketGoods();

    if (!items || items.length <= 0) {
      return;
    }

    items.forEach(item => {

      this.repo.OrderRowDelete(
        item,
        this.session.getString('AppBasketInfoCode') ?? ''
      )
        .pipe(
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe({
          next: () => {

            this.GetBasketGoods();

            this.OrderGetSummmary();
          }
        });

    });

  }
  ScrollToGroup(group: Group): void {

    if (!group) {
      return;
    }

    this.selectedGroupCode.set(
      group.GroupCode ?? ''
    );

    this.session.setItem(
      'DefaultGroupCode',
      group.GroupCode ?? ''
    );

    this.ScrollSelectedGroupIntoView(
      group.GroupCode ?? ''
    );

    if (group.Name === 'همه') {

      this.productScrollContainer
        ?.nativeElement
        ?.scrollTo({
          top: 0,
          behavior: 'smooth'
        });

      return;
    }

    const element =
      document.getElementById(
        'group-' + group.GroupCode
      );

    if (element) {

      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  OnProductScroll(): void {

    const headers =
      document.querySelectorAll(
        '[data-group-code]'
      );

    let activeGroupCode = '';

    const containerTop =
      this.productScrollContainer
        ?.nativeElement
        ?.getBoundingClientRect()
        ?.top ?? 0;

    headers.forEach((header: any) => {

      const rect =
        header.getBoundingClientRect();

      if (rect.top <= containerTop + 10) {

        activeGroupCode =
          header.getAttribute(
            'data-group-code'
          ) ?? '';
      }
    });

    if (
      activeGroupCode &&
      activeGroupCode !== this.selectedGroupCode()
    ) {

      this.selectedGroupCode.set(
        activeGroupCode
      );

      this.session.setItem(
        'DefaultGroupCode',
        activeGroupCode
      );

      this.ScrollSelectedGroupIntoView(
        activeGroupCode
      );
    }
  }

  ScrollSelectedGroupIntoView(groupCode: string): void {

    const element =
      document.getElementById(
        'menu-group-' + groupCode
      );

    if (element) {

      element.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }

  NormalizeGroupName(value: string): string {

    return value
      .replace(/\u064A/g, '\u06CC')
      .replace(/\u0643/g, '\u06A9')
      .trim();
  }

  OpenItem(item: any): void {

    this.selectedItem.set(item);
  }

  CloseItem(): void {

    this.selectedItem.set(null);
  }

  @HostListener('window:popstate', ['$event'])
  onPopState(event: PopStateEvent): void {

    if (this.selectedItem()) {

      this.CloseItem();
      return;
    }

    this.location.back();
  }

  @HostListener('window:resize')
  onWindowResize(): void {

    this.isDesktop.set(
      this.checkIfDesktop()
    );
  }

  checkIfDesktop(): boolean {

    return window.innerWidth >= 768;
  }

  isDesktopView(): boolean {

    return this.isDesktop();
  }

  convert_toman(maxsellprice: string): string {

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

  FormatNumber(value: any): string {

    return (+value || 0).toLocaleString('fa-IR');
  }

  GetImageSrc(item: any): string {

    if (!this.config.menuConfig.ShowProductImage) {
      return './assets/images/logo_color.png';
    }

    if (
      item.Imageitem &&
      item.Imageitem.length > 100
    ) {
      return item.Imageitem;
    }

    return './assets/images/logo_color.png';
  }

  LoadMissingImages(goods: Good[]): void {

    if (!this.config.menuConfig.ShowProductImage) {
      return;
    }

    goods.forEach((item: Good) => {

      if (!item.Imageitem || item.Imageitem.length <= 0) {

        this.repo.GetImage(item.GoodCode + '')
          .pipe(
            takeUntilDestroyed(this.destroyRef)
          )
          .subscribe({
            next: (data: any) => {

              if (!data?.Text) {
                return;
              }

              item.Imageitem =
                `data:image/jpeg;base64,${data.Text}`;

              this.Goods.update(items => [...items]);
              this.AllGoods.update(items => [...items]);
            }
          });
      }
    });
  }

  showToast =
    signal<boolean>(false);

  toastMessage =
    signal<string>('');

  basketPulse =
    signal<boolean>(false);
  ShowAddToast(item: any): void {

    this.toastMessage.set(
      `${item.GoodName} به سبد اضافه شد`
    );

    this.showToast.set(true);

    setTimeout(() => {
      this.showToast.set(false);
    }, 2200);
  }

  PlayAddSound(): void {

    const addedAudio = new Audio(
      'assets/sounds/added.m4a'
    );

    addedAudio.volume = 1;

    addedAudio.play();

    addedAudio.onended = () => {

      const nextItemAudio = new Audio(
        'assets/sounds/NextItem.m4a'
      );

      nextItemAudio.volume = 1;

      nextItemAudio.play();
    };
  }

  TriggerBasketPulse(): void {

    this.basketPulse.set(true);

    setTimeout(() => {
      this.basketPulse.set(false);
    }, 700);
  }






  StartFlyAnimation(sourceElement: HTMLElement): void {

    const basket =
      document.getElementById('basketButton');

    if (!basket) {
      return;
    }

    const sourceRect =
      sourceElement.getBoundingClientRect();

    const basketRect =
      basket.getBoundingClientRect();

    const clone =
      sourceElement.cloneNode(true) as HTMLElement;

    clone.style.position = 'fixed';

    clone.style.left =
      sourceRect.left + 'px';

    clone.style.top =
      sourceRect.top + 'px';

    clone.style.width =
      sourceRect.width + 'px';

    clone.style.height =
      sourceRect.height + 'px';

    clone.style.zIndex = '3000';

    clone.style.pointerEvents = 'none';

    clone.style.transition =
      'all 5s cubic-bezier(.2,.8,.2,1)';

    clone.style.borderRadius = '12px';

    clone.style.objectFit = 'cover';

    document.body.appendChild(clone);

    requestAnimationFrame(() => {

      clone.style.left =
        basketRect.left + 'px';

      clone.style.top =
        basketRect.top + 'px';

      clone.style.width = '20px';

      clone.style.height = '20px';

      clone.style.opacity = '0.2';

      clone.style.transform =
        'scale(.3)';
    });

    setTimeout(() => {

      clone.remove();

    }, 750);
  }


  ApplyMenuTheme(): void {

    const theme =
      this.config.menuTheme;

    if (!theme) {
      return;
    }

    const root =
      document.documentElement;

    const background =
      theme.background || '#FFF0E4';

    const surface =
      theme.surface || '#FFFFFF';

    const primary =
      theme.primary || '#6F4E37';

    const accent =
      theme.accent || '#007979';

    const text =
      theme.text || this.GetReadableTextColor(surface);

    root.style.setProperty('--kmenu-background', background);
    root.style.setProperty('--kmenu-surface', surface);
    root.style.setProperty('--kmenu-surface-hover', this.BuildColorMix(surface, '#ffffff', 0.06));

    root.style.setProperty('--kmenu-primary', primary);
    root.style.setProperty('--kmenu-primary-hover', this.BuildColorMix(primary, '#ffffff', 0.16));
    root.style.setProperty('--kmenu-primary-soft', this.HexToRGBA(primary, 0.12));
    root.style.setProperty('--kmenu-primary-border', this.HexToRGBA(primary, 0.32));
    root.style.setProperty('--kmenu-primary-shadow', this.HexToRGBA(primary, 0.28));
    root.style.setProperty('--kmenu-primary-text', this.GetReadableTextColor(primary));

    root.style.setProperty('--kmenu-accent', accent);
    root.style.setProperty('--kmenu-accent-hover', this.BuildColorMix(accent, '#ffffff', 0.16));
    root.style.setProperty('--kmenu-accent-soft', this.HexToRGBA(accent, 0.18));
    root.style.setProperty('--kmenu-accent-border', this.HexToRGBA(accent, 0.38));
    root.style.setProperty('--kmenu-accent-shadow', this.HexToRGBA(accent, 0.28));
    root.style.setProperty('--kmenu-accent-text', this.GetReadableTextColor(accent));

    root.style.setProperty('--kmenu-text', text);
    root.style.setProperty('--kmenu-muted', this.HexToRGBA(text, 0.68));

    root.style.setProperty('--kmenu-border', this.HexToRGBA(text, 0.14));
    root.style.setProperty('--kmenu-image-bg', this.HexToRGBA(text, 0.06));

    root.style.setProperty('--kmenu-page-bg', this.BuildPageBackground(background, primary, accent));

    root.style.setProperty('--kmenu-shadow-sm', `0 3px 10px ${this.HexToRGBA(primary, 0.12)}`);
    root.style.setProperty('--kmenu-shadow-md', `0 10px 28px ${this.HexToRGBA(primary, 0.18)}`);
    root.style.setProperty('--kmenu-shadow-lg', `0 18px 48px ${this.HexToRGBA(primary, 0.26)}`);
  }

  HexToRGBA(
    hex: string,
    alpha: number
  ): string {

    const rgb =
      this.HexToRgb(hex);

    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  }

  BuildColorMix(
    color1: string,
    color2: string,
    weight: number
  ): string {

    const c1 =
      this.HexToRgb(color1);

    const c2 =
      this.HexToRgb(color2);

    const r =
      Math.round(c1.r * (1 - weight) + c2.r * weight);

    const g =
      Math.round(c1.g * (1 - weight) + c2.g * weight);

    const b =
      Math.round(c1.b * (1 - weight) + c2.b * weight);

    return `rgb(${r}, ${g}, ${b})`;
  }

  HexToRgb(hex: string): {
    r: number;
    g: number;
    b: number;
  } {

    const fallback = {
      r: 255,
      g: 255,
      b: 255
    };

    if (!hex) {
      return fallback;
    }

    const cleanHex =
      hex.replace('#', '').trim();

    if (cleanHex.length !== 6) {
      return fallback;
    }

    return {
      r: parseInt(cleanHex.substring(0, 2), 16),
      g: parseInt(cleanHex.substring(2, 4), 16),
      b: parseInt(cleanHex.substring(4, 6), 16)
    };
  }

  BuildPageBackground(
    background: string,
    primary: string,
    accent: string
  ): string {

    return `
      radial-gradient(circle at top right, ${this.HexToRGBA(accent, 0.16)}, transparent 34%),
      radial-gradient(circle at bottom left, ${this.HexToRGBA(primary, 0.12)}, transparent 36%),
      linear-gradient(180deg, ${background}, ${this.BuildColorMix(background, '#000000', 0.03)})
    `;
  }

  GetReadableTextColor(
    color: string
  ): string {

    const rgb =
      this.HexToRgb(color);

    const brightness =
      (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;

    if (brightness < 145) {
      return '#FFFFFF';
    }

    return '#212529';
  }



}