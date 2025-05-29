import { AfterViewInit, Component, Input, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import 'leaflet-polylinedecorator'
import * as L from 'leaflet';
import { BrokerWebApiService } from '../../../services/BrokerWebApi.service';
import { FormControl } from '@angular/forms';
import { IDatepickerTheme } from 'ng-persian-datepicker';
import 'leaflet.markercluster';
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
      maxZoom: 25,
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

  chaikinSmooth(points: [number, number][], iterations = 2): [number, number][] {
    for (let it = 0; it < iterations; it++) {
      const newPoints: [number, number][] = [];
      for (let i = 0; i < points.length - 1; i++) {
        const [x1, y1] = points[i];
        const [x2, y2] = points[i + 1];

        const Q: [number, number] = [
          0.75 * x1 + 0.25 * x2,
          0.75 * y1 + 0.25 * y2
        ];

        const R: [number, number] = [
          0.25 * x1 + 0.75 * x2,
          0.25 * y1 + 0.75 * y2
        ];

        newPoints.push(Q, R);
      }
      points = [points[0], ...newPoints, points[points.length - 1]];
    }
    return points;
  }


  getTrackerData(): void {
    const brokerCode = this.BrokerCodeData;
    const startDate = '1404/03/08 16:00:00';
    const endDate = '1404/03/08 17:00:00';

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

  clearMap(): void {
    this.map?.eachLayer((layer: any) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        this.map?.removeLayer(layer);
      }
    });
  }







  addMarkers(): void {
    if (!this.map || !this.apiData.length) return;

    const firstIndex = 0;
    const lastIndex = this.apiData.length - 1;

    // اگر قبلاً خوشه‌ای بود، حذفش کن (اختیاری)
    // this.map.eachLayer(layer => {
    //   if (layer instanceof L.MarkerClusterGroup) this.map.removeLayer(layer);
    // });

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



  addMarkers2(): void {
    if (!this.map || !this.apiData.length) return;

    const firstIndex = 0;
    const lastIndex = this.apiData.length - 1;

    this.apiData.forEach((location, index) => {
      let icon: L.DivIcon;

      if (index === firstIndex) {
        // آیکون مخصوص اولین نقطه
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

        // اضافه کردن شعاع (دایره) دور نقطه
        L.circle([location.Latitude, location.Longitude], {
          radius: 50, // شعاع به متر
          color: 'blue',
          fillColor: 'rgba(0,0,255,0.2)',
          weight: 2,
          fillOpacity: 0.15
        }).addTo(this.map);

      } else if (index === lastIndex) {
        // آیکون مخصوص آخرین نقطه
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

        L.circle([location.Latitude, location.Longitude], {
          radius: 50,
          color: 'red',
          fillColor: 'rgba(255,0,0,0.2)',
          weight: 2,
          fillOpacity: 0.15
        }).addTo(this.map);

      } else {
        // آیکون معمولی بر اساس وضعیت
        icon = this.getMarkerIconByStatus(location.Status);
      }

      const popup = this.generatePopupContent(location);

      L.marker([location.Latitude, location.Longitude], { icon })
        .addTo(this.map)
        .bindPopup(popup, { maxWidth: 300 })
        .bindTooltip(`زمان: ${location.GpsDate}`, {
          direction: 'top',
          sticky: true,
          opacity: 0.85
        });
    });
  }


  addMarkers1(): void {
    if (!this.map) return;

    this.apiData.forEach((location, index) => {
      const icon = this.getMarkerIconByStatus(location.Status);
      const popup = this.generatePopupContent(location);

      const marker = L.marker([location.Latitude, location.Longitude], { icon });
      marker.addTo(this.map)
        .bindPopup(popup, { maxWidth: 300 })
        .bindTooltip(`زمان: ${location.GpsDate}`, {
          direction: 'top',
          sticky: true,
          opacity: 0.85
        });
    });
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

  getDirectionIcon(angle: number, status: string): L.DivIcon {
    const color = status === 'Stopped' ? 'red' : 'green';

    return L.divIcon({
      className: '',
      html: `
      <div style="
        width: 0;
        height: 0;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-bottom: 16px solid ${color};
        transform: rotate(${angle}deg);
        transform-origin: center;
        margin-top: -8px;
        margin-left: -8px;
      "></div>
    `,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
      popupAnchor: [0, -8],
      tooltipAnchor: [0, -8]
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

  getMarkerIcon(index: number, duration: number): L.Icon {
    let iconUrl = 'assets/images/location.png';
    if (index === 0) iconUrl = 'assets/images/start.png';
    else if (index === this.apiData.length - 1) iconUrl = 'assets/images/end.png';
    else if (duration > 100) iconUrl = 'assets/images/person.png';

    const isLarge = index === 0 || index === this.apiData.length - 1 || duration > 900;
    const iconSize = isLarge ? [50, 50] as [number, number] : [24, 24] as [number, number];
    const iconAnchor = isLarge ? [25, 50] as [number, number] : [12, 24] as [number, number];

    return L.icon({
      iconUrl,
      iconSize,
      iconAnchor,
      popupAnchor: [0, -40],
      tooltipAnchor: [0, -40],
      shadowSize: [41, 41]
    });
  }

  generateTooltipContent(location: any): string {
    return `
    <div style="
      font-size: 12px;
      line-height: 1.6;
      background: white;
      border: 1px solid #ccc;
      border-radius: 8px;
      padding: 12px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
      color: #333;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      max-width: 250px;
    ">
      <div><b style="color: #4A90E2;">کد موقعیت GPS:</b></div>
      <div style="text-align: right;">${location.GpsLocationCode}</div>

      <div><b style="color: #50E3C2;">کد بروکر:</b></div>
      <div style="text-align: right;">${location.BrokerRef}</div>

      <div><b style="color: #F5A623;">تاریخ GPS:</b></div>
      <div style="text-align: right;">${location.GpsDate}</div>

      <div><b style="color: #F8E71C;">تاریخ GPS بعدی:</b></div>
      <div style="text-align: right;">${location.NextGpsDate}</div>

      <div><b style="color: #D0021B;">مدت زمان:</b></div>
      <div style="text-align: right;">
        ${Math.floor(location.DurationInSeconds / 60)} دقیقه و ${location.DurationInSeconds % 60} ثانیه
      </div>
    </div>
  `;
  }

}
