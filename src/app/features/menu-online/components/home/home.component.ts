import { Component, inject, OnInit, Renderer2, TemplateRef, ViewChild } from '@angular/core';
import { OrderRepoService } from '../../services/order-repo.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Good } from '../../models/Good';
import { Group } from '../../models/group';
import { TextValue } from '../../models/textvalue';
import { BasketInfo } from '../../models/BasketInfo';
import { AppConfigService } from 'src/app/app-config.service';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import { HeaderService } from 'src/app/app-shell/framework-services/HeaderService';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true
})
export class HomeComponent implements OnInit {
  private readonly config = inject(AppConfigService);
  protected readonly session = inject(SessionStorageService);

  private readonly repo = inject(OrderRepoService);
  private readonly renderer = inject(Renderer2);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  constructor() { }

  @ViewChild('dialogTemplateEn') dialogTemplateEn!: TemplateRef<any>;
  @ViewChild('dialogTemplateFa') dialogTemplateFa!: TemplateRef<any>;

  Goods: Good[] = [];
  BasketGoods: Good[] = [];
  basketsum!: string;
  Groups: Group[] = [];
  isDesktop: boolean = true;

  menuId!: string;
  mizname: string = 'کافه کتاب ققنوس';
  miztype: string = '';
  id: string = '';

  TextValue!: TextValue;
  BasketInfo: BasketInfo[] = [];

  currentSlide: number = 0;

  images: { src: string, alt: string }[] = [
    { src: './assets/images/cafe_001.jpg', alt: 'cafe_001' },
    { src: './assets/images/cafe_002.jpg', alt: 'cafe_002' },
    { src: './assets/images/cafe_003.jpg', alt: 'cafe_003' },
    { src: './assets/images/cafe_004.jpg', alt: 'cafe_004' }
  ];

  glowX: number = -500;
  glowY: number = -500;

  particles: any[] = [];
  particleId: number = 0;
  lastParticleTime: number = 0;

  ngOnInit(): void {

    this.session.setItem('RstmizCode', '41');

    this.repo.GetRstMizData('' + this.session.getString('RstmizCode')).subscribe(e => {

      this.BasketInfo = e;

      if (this.BasketInfo[0].InfoState === '0' || this.BasketInfo[0].InfoState === '3') {

        this.repo.OrderInfoInsert(this.BasketInfo[0].RstmizCode!, this.BasketInfo[0].Today!).subscribe(e => {

          this.BasketInfo = e;

          this.session.setItem('Today', this.BasketInfo[0].Today!);
          this.session.setItem('RstmizCode', this.BasketInfo[0].RstmizCode!);
          this.session.setItem('RstMizName', this.BasketInfo[0].RstMizName!);
          this.session.setItem('AppBasketInfoCode', this.BasketInfo[0].AppBasketInfoCode!);
          this.session.setItem('MizType', this.BasketInfo[0].MizType + '');

          this.mizname = this.BasketInfo[0].RstMizName + '';
          if (this.config.apiUrl === 'http://94.139.164.68:60005/api/') {
            this.router.navigate(['/menu/menu-fa']);
          }




        });

      } else {

        this.session.setItem('Today', this.BasketInfo[0].Today!);
        this.session.setItem('RstmizCode', this.BasketInfo[0].RstmizCode!);
        this.session.setItem('RstMizName', this.BasketInfo[0].RstMizName!);
        this.session.setItem('AppBasketInfoCode', this.BasketInfo[0].AppBasketInfoCode!);
        this.session.setItem('MizType', this.BasketInfo[0].MizType + '');

        this.mizname = this.BasketInfo[0].RstMizName + '';

        if (this.config.apiUrl === 'http://94.139.164.68:60005/api/') {
          this.router.navigate(['/menu/menu-fa']);
        }
      }

    });

    setInterval(() => {
      this.nextSlide();
    }, 4000);
  }

  nextSlide(): void {

    this.currentSlide =
      (this.currentSlide + 1) % this.images.length;
  }

  openDialog_fa(): void {

    this.miztype =
      this.session.getString('MizType') + '';

    this.router.navigate(['/menu/menu-fa']);
  }

  closeDialog(): void {

    this.router.navigate(['/menu-fa']);
  }

  onStartButtonPointerMove(event: PointerEvent): void {

    const rect =
      (event.currentTarget as HTMLElement).getBoundingClientRect();

    this.glowX =
      event.clientX - rect.left;

    this.glowY =
      event.clientY - rect.top;

    const now =
      Date.now();

    if (now - this.lastParticleTime > 55) {

      this.lastParticleTime = now;

      this.createStartButtonParticle();
    }
  }

  onStartButtonPointerLeave(): void {

    this.glowX = -500;

    this.glowY = -500;
  }

  createStartButtonParticle(): void {

    const particle = {
      id: this.particleId++,
      x: this.glowX + ((Math.random() - 0.5) * 48),
      y: this.glowY + ((Math.random() - 0.5) * 48),
      size: 5 + Math.random() * 8,
      delay: Math.random() * 0.15
    };

    this.particles = [
      ...this.particles,
      particle
    ];

    setTimeout(() => {

      this.particles =
        this.particles.filter(p =>
          p.id !== particle.id
        );

    }, 1400);
  }

  contactInfo = [
    { label: 'شماره تماس کتاب‌فروشی:', value: '66414118' },
    { label: 'شماره تماس کافه:', value: '66403386' },
    { label: 'اینستاگرام:', value: 'qoqnoosbookcafe' },
    { label: 'واتس‌آپ مجموعه:', value: '100 10 95 - 0936' },
    { label: 'سایت:', value: 'www.qoqnoosbookcafe.com' },
    { label: 'آدرس:', value: 'تهران، خیابان انقلاب، خیابان وصال شیرازی، کوچه شفیعی، شماره 1' }
  ];
}