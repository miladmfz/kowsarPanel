import { AfterViewInit, Component, Input, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import 'leaflet-polylinedecorator'
import * as L from 'leaflet';
import { BrokerWebApiService } from '../../../services/BrokerWebApi.service';
import { FormControl } from '@angular/forms';
import { IDatepickerTheme } from 'ng-persian-datepicker';
import 'leaflet.markercluster';
import { toGregorian } from 'jalaali-js';
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

  /** آیکون نقطهٔ قرمز برای مشتریان ثابت */
  /** آیکون قرمز مشتری – قبلاً تعریف شده بود */
  private readonly customerRedIcon = L.icon({
    iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28]
  });

  /** آیکون سبز زمانی که بازاریاب در ۵۰ متری مشتری قرار گرفته باشد */
  private readonly customerGreenIcon = L.icon({
    iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/green-dot.png',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28]
  });

  /** برای دسترسی بعدی به هر مارکر مشتری */
  private customerMarkers = new Map<number, L.Marker>();  // key = CustomerCode


  Customerlocation: any[] = [
    {
      CustomerCode: 10,
      CustName_Small: "عنوان 3  مشتري 3",
      EconomyCode1: "35.704827, 51.371032"
    },
    {
      CustomerCode: 8,
      CustName_Small: "عنوان 1  مشتري 1",
      EconomyCode1: "35.697679, 51.366789"
    },
    {
      CustomerCode: 9,
      CustName_Small: "عنوان 2  مشتري 2",
      EconomyCode1: "35.698920, 51.372009"
    }
  ];

  constructor(
    private readonly router: Router,
    private repo: BrokerWebApiService,
    private renderer: Renderer2
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


  getTrackerData1(): void {
    const brokerCode = this.BrokerCodeData;
    const startDate = '1404/03/10 12:00:00';
    const endDate = '1404/03/10 13:00:00';

    this.repo.GetGpstracker(brokerCode, startDate, endDate).subscribe((data: any) => {
      //this.repo.GetGpstracker(brokerCode, this.startDate_form.value, this.endDate_form.value).subscribe((data: any) => {

      this.apiData = data.Gpstrackers;

      this.clearMap(); // پاک کردن لایه‌های قبلی

      if (this.apiData && this.apiData.length > 0) {
        this.hasData = this.apiData.length > 0; // اینجا مقدار hasData را بروزرسانی می‌کنید
        const first = this.apiData[0];
        if (first && first.Latitude && first.Longitude && this.map) {
          this.map.setView([first.Latitude, first.Longitude], 15);
        }

        this.addMarkers();
        this.drawPolyline();
        this.noDataMessage = ''; // پاک کردن پیام خطا
      } else {
        this.hasData = false;
        this.noDataMessage = 'موردی یافت نشد'; // تنظیم پیام خطا
      }
    });
  }


  /** مارکر مشتری را سبز می‌کند اگر یکی از نقاط مسیر در ≤۵۰ متر او باشد */
  updateCustomerProximity(): void {
    if (!this.map || !this.apiData?.length) return;

    // همهٔ نقاط مسیرِ بازاریاب را به L.LatLng تبدیل می‌کنیم
    const routePoints = this.apiData
      .map(p => L.latLng(parseFloat(p.Latitude), parseFloat(p.Longitude)))
      .filter(ll => !isNaN(ll.lat) && !isNaN(ll.lng));

    this.customerMarkers.forEach(marker => {
      const customerLatLng = marker.getLatLng();
      const isNear = routePoints.some(rp => customerLatLng.distanceTo(rp) <= 50);

      marker.setIcon(isNear ? this.customerGreenIcon : this.customerRedIcon);
    });
  }


  addCustomerMarkers(): void {
    if (!this.map || !this.Customerlocation?.length) return;

    const customerLayer = L.layerGroup();

    this.Customerlocation.forEach(cust => {
      const [latStr, lngStr] = cust.EconomyCode1.split(',').map(s => s.trim());
      const lat = parseFloat(latStr);
      const lng = parseFloat(lngStr);
      if (isNaN(lat) || isNaN(lng)) return;

      const popup = `
      <b>${cust.CustName_Small}</b><br>
      کد مشتری: ${cust.CustomerCode}
    `;

      const marker = L.marker([lat, lng], { icon: this.customerRedIcon })
        .addTo(customerLayer)
        .bindPopup(popup)
        .bindTooltip(cust.CustName_Small, { direction: 'top', sticky: true });

      this.customerMarkers.set(cust.CustomerCode, marker);   //  ← ← (1) ذخیرهٔ مارکر
    });

    customerLayer.addTo(this.map);
  }

  /** نقاط ثابت مشتریان را (با آیکون قرمز) به نقشه اضافه می‌کند */
  addCustomerMarkers1(): void {
    if (!this.map || !this.Customerlocation?.length) return;

    // می‌توانی اگر خوشه‌بندی خواستی، جای ← L.layerGroup از L.markerClusterGroup استفاده کنی
    const customerLayer = L.layerGroup();

    this.Customerlocation.forEach(cust => {
      const [latStr, lngStr] = cust.EconomyCode1.split(',').map(s => s.trim());
      const lat = parseFloat(latStr);
      const lng = parseFloat(lngStr);

      if (isNaN(lat) || isNaN(lng)) return; // مختصات نامعتبر

      const popup = `
      <b>${cust.CustName_Small}</b><br>
      کد مشتری: ${cust.CustomerCode}
    `;

      L.marker([lat, lng], { icon: this.customerRedIcon })
        .addTo(customerLayer)
        .bindPopup(popup)
        .bindTooltip(cust.CustName_Small, { direction: 'top', sticky: true });
    });

    // لایهٔ نقاط مشتری را به نقشه اضافه کن
    customerLayer.addTo(this.map);
  }

  getTrackerData(): void {
    const brokerCode = this.BrokerCodeData;
    const startDate = '1404/03/10 12:00:00';
    const endDate = '1404/03/10 13:00:00';

    this.repo.GetGpstracker(brokerCode, startDate, endDate).subscribe((data: any) => {
      this.apiData = data.Gpstrackers;

      this.clearMap();        // پاک کردن لایه‌های قبلی
      // ← نشانه‌گذاری نقاط نزدیک

      if (this.apiData && this.apiData.length > 0) {
        this.hasData = true;

        const first = this.apiData[0];
        if (first && first.Latitude && first.Longitude && this.map) {
          this.map.setView([first.Latitude, first.Longitude], 15);
        }
        this.addCustomerMarkers();  // ← اضافه شد
        this.updateCustomerProximity();
        this.addMarkers();
        this.drawPolyline();

        // ✅ نمایش توقف‌ها
        const stops = this.calculateStopDurations();
        this.addStopMarkers(stops);

        this.noDataMessage = '';
      } else {
        this.hasData = false;
        this.noDataMessage = 'موردی یافت نشد';
      }
    });
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

