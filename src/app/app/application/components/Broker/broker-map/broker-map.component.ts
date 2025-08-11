import { AfterViewInit, Component, Input, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import 'leaflet-polylinedecorator'
import * as L from 'leaflet';
import { BrokerWebApiService } from '../../../services/BrokerWebApi.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IDatepickerTheme } from 'ng-persian-datepicker';
import 'leaflet.markercluster';
import { toGregorian } from 'jalaali-js';
import * as moment from 'jalali-moment';

@Component({
  selector: 'app-broker-map',
  templateUrl: './broker-map.component.html',
  styleUrls: ['./broker-map.component.css']
})
export class BrokerMapComponent implements AfterViewInit {
  map: L.Map | undefined;
  hasData: boolean = false;
  noDataMessage: string = ''; // پیام خطا برای عدم وجود داده

  @Input() BrokerCodeData: string = '';

  customTheme: Partial<IDatepickerTheme> = {
    selectedBackground: '#D68E3A',
    selectedText: '#FFFFFF',
  };

  startDate_form = new FormControl();
  endDate_form = new FormControl();
  apiData: any[] = []; // مقدار پیش‌فرض داده‌ها
  stopDurations: any[] = []; // مقدار پیش‌فرض داده‌ها

  filterForm!: FormGroup;
  ngOnInit(): void {
    /* ساخت فرم با مقادیر پیش‌فرض */
    this.filterForm = this.fb.group({
      day: ['', Validators.required],          // تاریخ
      starttime: ['07:00', Validators.required], // ساعت شروع
      endtime: ['23:00', Validators.required]    // ساعت پایان
    });

    /* هر بار تاریخ تغییر کند ساعت‌ها ریست شوند */
    this.filterForm.get('day')!.valueChanges.subscribe(() => {
      this.filterForm.patchValue(
        { starttime: '07:00', endtime: '23:00' },
        { emitEvent: false }
      );
    });
  }
  changeDate(direction: number): void {
    const current = this.filterForm.get('day')?.value;
    const mDate = moment(current, 'jYYYY/jMM/jDD');

    if (!mDate.isValid()) return;

    const newDate = mDate.add(direction, 'day').format('jYYYY/jMM/jDD');
    this.filterForm.get('day')?.setValue(newDate);
  }


  /** آیکون نقطهٔ قرمز برای مشتریان ثابت */
  /** آیکون قرمز مشتری – قبلاً تعریف شده بود */
  private readonly customerRedIcon = L.icon({
    iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28]
  });

  private readonly customerGreenIcon = L.icon({
    iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/green-dot.png',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28]
  });

  private readonly customerYellowIcon = L.icon({
    iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/yellow-dot.png',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28]
  });

  private readonly customerBlueIcon = L.icon({
    iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/blue-dot.png',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28]
  });



  /** برای دسترسی بعدی به هر مارکر مشتری */
  private customerMarkers = new Map<number, L.Marker>();  // key = CustomerCode


  Customerlocation: any[] = []



  constructor(
    private readonly router: Router,
    private repo: BrokerWebApiService,
    private renderer: Renderer2,
    private fb: FormBuilder           // ← افزوده شد

  ) { }

  ngAfterViewInit(): void {
    // اطمینان از اینکه نقشه بارگذاری شده و به درستی مقداردهی شده است
    this.initializeMap();

    // فراخوانی getTrackerData زمانی که نقشه آماده است
    this.map!.whenReady(() => {
      this.addCustomerMarkers();            // ← اضافه شد

      if (this.apiData && this.apiData.length > 0) {
        this.addMarkers();
        this.drawPolyline();
      } else {
        console.log('No data available to display on map');
      }
    });


  }




  initializeMap(): void {
    this.map = L.map('map', {
      center: [35.7053458, 51.3686215],
      zoom: 15,
      zoomControl: true,
      scrollWheelZoom: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
      minZoom: 13,
      noWrap: false
    }).addTo(this.map);

    setTimeout(() => {
      this.map?.invalidateSize();
    }, 0);

    this.map.getContainer().addEventListener('wheel', (e: WheelEvent) => {
      if (!e.ctrlKey) e.preventDefault();
    }, { passive: false });
  }




  /* ----------  افزودن مارکرهای مشتری  ---------------- */
  addCustomerMarkers(): void {
    if (!this.map || !this.Customerlocation?.length) return;

    const customerLayer = L.layerGroup();

    this.Customerlocation.forEach(cust => {
      const [latStr, lngStr] = (cust.EconomyCode1 || '').split(',').map(s => s.trim());
      const lat = parseFloat(latStr);
      const lng = parseFloat(lngStr);
      if (isNaN(lat) || isNaN(lng)) return;          // مختصات معتبر نیست

      const popupHtml = `
      <b>${cust.CustName_Small}</b><br>
      کد مشتری: ${cust.CustomerCode}<br>
      وضعیت: ${cust.Explain || '-'}<br>
      مبلغ کل: ${cust.SumnPrice.toLocaleString()}<br>
      تعداد: ${cust.SumAmount}
    `;

      const marker = L.marker([lat, lng], { icon: this.customerRedIcon })
        .addTo(customerLayer)
        .bindPopup(popupHtml)
        .bindTooltip(cust.CustName_Small, { direction: 'top', sticky: true });

      /* در Map ذخیره می‌کنیم تا بعداً به آن دسترسی داشته باشیم */
      this.customerMarkers.set(cust.CustomerCode, marker);
    });

    customerLayer.addTo(this.map);
  }
  updateCustomerProximity(): void {
    if (!this.map || !this.apiData?.length) return;

    const routePoints = this.apiData
      .map(p => L.latLng(parseFloat(p.Latitude), parseFloat(p.Longitude)))
      .filter(ll => !isNaN(ll.lat) && !isNaN(ll.lng));

    // شمارش وضعیت‌ها
    let total = 0;
    let nearGreen = 0;
    let nearYellow = 0;
    let farBlue = 0;
    let veryFarRed = 0;

    this.customerMarkers.forEach((marker, customerCode) => {
      const cust = this.Customerlocation.find(c => c.CustomerCode === customerCode);
      if (!cust) return;

      /* محاسبهٔ کمترین فاصله (متر) مشتری تا مسیر */
      const customerLatLng = marker.getLatLng();
      const minDistance = Math.min(...routePoints.map(rp => customerLatLng.distanceTo(rp)));

      /* انتخاب آیکون براساس منطق درخواستی */
      let icon = this.customerRedIcon;
      const sumAmount = +cust.SumAmount;
      const hasExplain = !!(cust.Explain && cust.Explain.trim());

      total++;

      if (minDistance <= 50 && sumAmount > 0) {
        icon = this.customerGreenIcon;
        nearGreen++;
      } else if (minDistance <= 50 && sumAmount === 0) {
        icon = this.customerYellowIcon;
        nearYellow++;
      } else if ((minDistance > 50 && minDistance < 300) && (hasExplain || sumAmount > 0)) {
        icon = this.customerBlueIcon;
        farBlue++;
      } else if (minDistance >= 300) {
        icon = this.customerRedIcon;
        veryFarRed++;
      }

      marker.setIcon(icon);
    });

    // بروزرسانی باکس آماری
    this.updateCustomerSummary({
      total,
      nearGreen,
      nearYellow,
      farBlue,
      veryFarRed
    });
  }


  // نمونه تعریف متغیر داخل کامپوننت
  customerStats: {
    total: number;
    nearGreen: number;
    nearYellow: number;
    farBlue: number;
    veryFarRed: number;
  } | null = null;

  // وقتی داده‌ها رو دریافت کردی این متد رو صدا بزن
  updateCustomerSummary(stats: {
    total: number;
    nearGreen: number;
    nearYellow: number;
    farBlue: number;
    veryFarRed: number;
  }): void {
    this.customerStats = stats;
  }







  async getTrackerData(): Promise<void> {
    if (this.filterForm.invalid) return;

    const { day, starttime, endtime } = this.filterForm.value;

    const startDate = `${day} ${starttime}:00`;
    const endDate = `${day} ${endtime}:00`;
    const brokerCode = this.BrokerCodeData;




    // const startDate = '1404/03/10 12:00:00';
    // const endDate = '1404/03/10 13:00:00';
    try {

      await this.repo.GetBrokerCustomer(brokerCode, day).subscribe((data: any) => {

        this.Customerlocation = data.BrokerCustomers
        this.addCustomerMarkers();  // ← اضافه شد
        this.updateCustomerProximity();
      });






      await this.repo.GetGpstracker(brokerCode, startDate, endDate).subscribe((data: any) => {
        this.apiData = data.Gpstrackers;



        this.clearMap();

        if (this.apiData && this.apiData.length > 0) {
          this.hasData = true;

          const first = this.apiData[0];
          if (first && first.Latitude && first.Longitude && this.map) {
            this.map.setView([first.Latitude, first.Longitude], 15);
          }

          this.addMarkers();
          this.drawPolyline();

          const stops = this.calculateStopDurations();
          this.addStopMarkers(stops);

          this.noDataMessage = '';
        } else {
          this.hasData = false;
          this.noDataMessage = 'موردی یافت نشد';
        }
      });

    } catch (error) {
      console.error('Error loading tracker data', error);
      this.noDataMessage = 'خطا در بارگذاری داده‌ها';
    }

  }





  clearMap(): void {
    this.map?.eachLayer((layer: any) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        this.map?.removeLayer(layer);
      }
    });
    this.customerMarkers.clear();   // ← افزودنی

  }





  addMarkers(): void {
    if (!this.map || !this.apiData.length) return;

    const firstIndex = 0;
    const lastIndex = this.apiData.length - 1;

    this.map.eachLayer(layer => {
      if (layer instanceof L.MarkerClusterGroup) this.map.removeLayer(layer);
    });

    const markers = L.markerClusterGroup();

    this.apiData.forEach((location, index) => {
      const lat = parseFloat(location.Latitude);
      const lng = parseFloat(location.Longitude);

      if (isNaN(lat) || isNaN(lng)) {
        console.warn('Invalid coordinates skipped:', location);
        return; // رد این نقطه
      }

      let icon: L.DivIcon;

      if (index === firstIndex) {
        icon = L.divIcon({
          className: '',
          html: `<div style="
          width: 30px;
          height: 30px;
          background-color: blue;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(0,0,255,0.8);
        "></div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
          popupAnchor: [0, -15],
          tooltipAnchor: [0, -15]
        });

        // دایره جداگانه دور اولین نقطه (مستقیماً روی نقشه)
        L.circle([lat, lng], {
          radius: 50,
          color: 'blue',
          fillColor: 'rgba(0,0,255,0.2)',
          weight: 2,
          fillOpacity: 0.15
        }).addTo(this.map);

      } else if (index === lastIndex) {
        icon = L.divIcon({
          className: '',
          html: `<div style="
          width: 30px;
          height: 30px;
          background-color: red;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(255,0,0,0.8);
        "></div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
          popupAnchor: [0, -15],
          tooltipAnchor: [0, -15]
        });

        L.circle([lat, lng], {
          radius: 50,
          color: 'red',
          fillColor: 'rgba(255,0,0,0.2)',
          weight: 2,
          fillOpacity: 0.15
        }).addTo(this.map);

      } else {
        icon = this.getMarkerIconByStatus(location.Status);
      }

      const popup = this.generatePopupContent(location);

      const marker = L.marker([lat, lng], { icon })
        .bindPopup(popup, { maxWidth: 300 })
        .bindTooltip(`زمان: ${location.GpsDate}`, {
          direction: 'top',
          sticky: true,
          opacity: 0.85
        });

      markers.addLayer(marker);
    });

    // اضافه کردن خوشه مارکرها به نقشه
    this.map.addLayer(markers);
  }






  getMarkerIconByStatus(status: string): L.DivIcon {
    let color = 'gray';

    if (status === 'Stopped') color = 'red';
    else if (status === 'Moving') color = 'green';

    return L.divIcon({
      className: '', // بدون کلاس پیش‌فرض leaflet
      html: `
      <div style="
        width: 20px;
        height: 20px;
        background-color: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 0 3px rgba(0,0,0,0.6);
      "></div>
    `,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      popupAnchor: [0, -10],
      tooltipAnchor: [0, -10]
    });
  }




  drawPolyline(): void {
    if (!this.apiData || this.apiData.length < 2) return;

    for (let i = 0; i < this.apiData.length - 1; i++) {
      const from = this.apiData[i];
      const to = this.apiData[i + 1];
      const status = to.Status;

      const color = status === 'Stopped' ? 'red' : 'green';

      const latlngs: [number, number][] = [
        [from.Latitude, from.Longitude],
        [to.Latitude, to.Longitude]
      ];

      // رسم مسیر
      const polyline = L.polyline(latlngs, {
        color,
        weight: 4,
        opacity: 0.75
      }).addTo(this.map!);

      // اضافه کردن فلش روی مسیر
      // @ts-ignore
      L.polylineDecorator(polyline, {
        patterns: [
          {
            offset: '50%', // وسط مسیر
            repeat: 0,
            symbol: (L as any).Symbol.arrowHead({
              pixelSize: 10,
              polygon: false,
              pathOptions: { stroke: true, color: color }
            })
          }
        ]
      }).addTo(this.map!);
    }
  }


  generatePopupContent(location: any): string {
    return `
    <div style="font-size: 13px; line-height: 1.6; color: #333;">
      <b>⏱ زمان GPS:</b> ${location.GpsDate}<br>
      <b>🚗 وضعیت:</b> ${location.Status}<br>
      <b>💨 سرعت:</b> ${location.Speed} km/h<br>
      <b>🎯 دقت:</b> ${location.Accuracy} متر<br>
      ${location.Description ? `<b>📝 توضیح:</b> ${location.Description}<br>` : ''}
    </div>
  `;
  }

  addStopMarkers(stops: { start: string, end: string, durationMinutes: number, location: any }[]): void {
    if (!this.map) return;

    stops.forEach(stop => {
      const lat = parseFloat(stop.location.Latitude);
      const lng = parseFloat(stop.location.Longitude);

      if (isNaN(lat) || isNaN(lng)) return;

      const icon = L.divIcon({
        className: '',
        html: `<div style="
        width: 32px;
        height: 32px;
        background-color: orange;
        border: 4px solid white;
        border-radius: 50%;
        box-shadow: 0 0 12px rgba(255,165,0,0.95);
        transform: scale(1.2);
      "></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
      });

      const popup = `
      <b>⏸ توقف</b><br>
      از: ${stop.start}<br>
      تا: ${stop.end}<br>
      ⏱ مدت: ${stop.durationMinutes} دقیقه
    `;

      L.marker([lat, lng], { icon })
        .addTo(this.map!)
        .bindPopup(popup)
        .bindTooltip(`توقف ${stop.durationMinutes} دقیقه`, {
          direction: 'top',
          sticky: true,
          opacity: 0.95
        });
    });
  }


  calculateStopDurations(): { start: string, end: string, durationMinutes: number, location: any }[] {
    const stops: { start: string, end: string, durationMinutes: number, location: any }[] = [];

    for (let i = 0; i < this.apiData.length - 1; i++) {
      const current = this.apiData[i];
      const next = this.apiData[i + 1];

      const start = this.toGregorianDate(current.GpsDate);
      const end = this.toGregorianDate(next.GpsDate);

      const duration = (end.getTime() - start.getTime()) / 1000 / 60; // دقیقه

      // اگر اختلاف زمان بیشتر از 5 دقیقه بود، یعنی بین این دو نقطه توقف داشته
      if (duration >= 5) {
        stops.push({
          start: current.GpsDate,
          end: next.GpsDate,
          durationMinutes: Math.round(duration),
          location: current
        });
      }
    }

    return stops;
  }
  toGregorianDate(jalali: string): Date {
    const [datePart, timePart] = jalali.split(' ');
    const [jy, jm, jd] = datePart.split('/').map(Number);
    const [hh, mm, ss] = timePart.split(':').map(Number);

    const { gy, gm, gd } = toGregorian(jy, jm, jd);
    return new Date(gy, gm - 1, gd, hh, mm, ss); // ماه‌ها در JS از 0 شروع می‌شن
  }

}



