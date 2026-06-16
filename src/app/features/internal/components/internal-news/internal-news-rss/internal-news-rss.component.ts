import { Component, inject, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { RssService, RssItem } from 'src/app/app-shell/framework-services/rss.service';

type NewsCategory =
  | 'all'
  | 'accounting'
  | 'tax'
  | 'economy'
  | 'tech'
  | 'politics'
  | 'science';

@Component({
  selector: 'app-internal-news-rss',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './internal-news-rss.component.html',
  styleUrls: ['./internal-news-rss.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InternalNewsRssComponent implements OnInit {

  private readonly rssService = inject(RssService);
  private readonly cdr = inject(ChangeDetectorRef);

  selectedTab = 'SepidarTax';
  selectedCategory: NewsCategory = 'all';

  loading = false;
  errorMessage = '';

  rssFeeds = [
    { name: 'SepidarTax', label: 'سپیدار مالیات', icon: 'fas fa-file-invoice-dollar' },
    { name: 'MehrTax', label: 'مهر مالیاتی', icon: 'fas fa-landmark' },

    { name: 'DonyaEqtesad', label: 'دنیای اقتصاد', icon: 'fas fa-chart-line' },
    { name: 'KhabarOnline', label: 'خبرآنلاین', icon: 'fas fa-rss' },

    { name: 'Digiato', label: 'دیجیاتو', icon: 'fas fa-microchip' },
    { name: 'Hamshahri', label: 'همشهری', icon: 'fas fa-city' },

    { name: 'Varzesh3All', label: 'ورزش ۳', icon: 'fas fa-futbol' },
    { name: 'Varzesh3DomesticFootball', label: 'فوتبال داخلی', icon: 'fas fa-shield-halved' },
    { name: 'Varzesh3ForeignFootball', label: 'فوتبال خارجی', icon: 'fas fa-globe' },
    { name: 'Varzesh3OtherSports', label: 'سایر ورزش‌ها', icon: 'fas fa-medal' }
  ];

  categories: { id: NewsCategory; label: string; icon: string }[] = [
    { id: 'all', label: 'همه', icon: 'fas fa-layer-group' },
    { id: 'accounting', label: 'حسابداری', icon: 'fas fa-calculator' },
    { id: 'tax', label: 'مالیات', icon: 'fas fa-file-invoice-dollar' },
    { id: 'economy', label: 'اقتصاد', icon: 'fas fa-chart-line' },
    { id: 'tech', label: 'فناوری', icon: 'fas fa-microchip' },
    { id: 'politics', label: 'رسمی / سیاسی', icon: 'fas fa-landmark' },
    { id: 'science', label: 'عمومی', icon: 'fas fa-newspaper' }
  ];

  private cache: Record<string, RssItem[]> = {};

  async ngOnInit() {
    await this.loadTab(this.selectedTab);
  }
  toShamsi(date?: string): string {

    if (!date) {
      return '-';
    }

    try {

      return new Intl.DateTimeFormat('fa-IR', {
        dateStyle: 'short',
        timeStyle: 'short',
        timeZone: 'Asia/Tehran'
      }).format(new Date(date));

    } catch {

      return '-';
    }
  }
  async selectTab(name: string, forceRefresh = false) {
    this.selectedTab = name;
    this.selectedCategory = 'all';
    this.errorMessage = '';

    if (!forceRefresh && this.cache[name]) {
      this.cdr.markForCheck();
      return;
    }

    await this.loadTab(name);
  }

  selectCategory(category: NewsCategory) {
    this.selectedCategory = category;
    this.cdr.markForCheck();
  }

  async refresh() {
    await this.selectTab(this.selectedTab, true);
  }

  private async loadTab(name: string) {
    this.loading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    try {
      const items = await firstValueFrom(
        this.rssService.getRssBySource(name)
      );

      this.cache[name] = (items || [])
        .filter(item => !!item?.title)
        .sort((a, b) => this.getDateTime(b.pubDate) - this.getDateTime(a.pubDate));

    } catch (e) {
      console.log('RSS ERROR:', name, e);
      this.cache[name] = [];
      this.errorMessage = 'دریافت اخبار با خطا مواجه شد';
    }

    this.loading = false;
    this.cdr.markForCheck();
  }

  get items(): RssItem[] {
    return this.cache[this.selectedTab] || [];
  }

  get filteredItems(): RssItem[] {
    if (this.selectedCategory === 'all') {
      return this.items;
    }

    return this.items.filter(item => this.getItemCategory(item) === this.selectedCategory);
  }

  get selectedFeedLabel(): string {
    return this.rssFeeds.find(x => x.name === this.selectedTab)?.label || this.selectedTab;
  }

  getItemCategory(item: RssItem): NewsCategory {
    const category = `${item.category || ''}`.toLowerCase();
    const source = `${item.source || ''}`.toLowerCase();
    const text = `${item.title || ''} ${item.description || ''} ${item.category || ''} ${item.source || ''}`.toLowerCase();

    if (
      category.includes('accounting') ||
      category.includes('accountingtax') ||
      source.includes('accpress') ||
      source.includes('acctaxnews') ||
      text.includes('حسابداری') ||
      text.includes('حسابدار') ||
      text.includes('صورت مالی') ||
      text.includes('استاندارد حسابداری')
    ) {
      return 'accounting';
    }

    if (
      category.includes('tax') ||
      source.includes('sepidartax') ||
      source.includes('mehrtax') ||
      text.includes('مالیات') ||
      text.includes('مودیان') ||
      text.includes('اظهارنامه') ||
      text.includes('ارزش افزوده') ||
      text.includes('پایانه فروشگاهی')
    ) {
      return 'tax';
    }

    if (
      category.includes('economy') ||
      text.includes('اقتصاد') ||
      text.includes('بازار') ||
      text.includes('دلار') ||
      text.includes('طلا') ||
      text.includes('بورس') ||
      text.includes('تورم') ||
      text.includes('بانک')
    ) {
      return 'economy';
    }

    if (
      category.includes('tech') ||
      text.includes('فناوری') ||
      text.includes('تکنولوژی') ||
      text.includes('هوش مصنوعی') ||
      text.includes('موبایل') ||
      text.includes('اینترنت') ||
      text.includes('نرم افزار')
    ) {
      return 'tech';
    }

    if (
      category.includes('politics') ||
      text.includes('دولت') ||
      text.includes('مجلس') ||
      text.includes('وزیر') ||
      text.includes('رئیس')
    ) {
      return 'politics';
    }

    return 'science';
  }

  getCategoryLabel(item: RssItem): string {
    return this.categories.find(x => x.id === this.getItemCategory(item))?.label || 'عمومی';
  }

  getCategoryClass(item: RssItem): string {
    return `news-category-${this.getItemCategory(item)}`;
  }

  open(link?: string) {
    if (!link) {
      return;
    }

    window.open(link, '_blank', 'noopener,noreferrer');
  }

  trackByFeed(index: number, item: any) {
    return item.name;
  }

  trackByCategory(index: number, item: any) {
    return item.id;
  }

  trackByItem(index: number, item: RssItem) {
    return item.link || `${item.title}-${index}`;
  }

  private getDateTime(date?: string): number {
    const time = new Date(date || '').getTime();
    return Number.isNaN(time) ? 0 : time;
  }
}