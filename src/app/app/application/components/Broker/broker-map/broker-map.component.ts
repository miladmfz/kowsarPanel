import { AfterViewInit, Component, Input, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { BrokerWebApiService } from '../../../services/BrokerWebApi.service';
import { FormControl } from '@angular/forms';
import { IDatepickerTheme } from 'ng-persian-datepicker';

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
      maxZoom: 17,
      minZoom: 13,
      noWrap: false
    }).addTo(this.map);

    setTimeout(() => {
      this.map?.invalidateSize();
    }, 0);

    // اطمینان از مقداردهی نقشه قبل از تعاملات
    this.map.getContainer().addEventListener('wheel', (e: WheelEvent) => {
      if (!e.ctrlKey) {
        e.preventDefault();
      }
    }, { passive: false });
  }

  getTrackerData(): void {
    const brokerCode = this.BrokerCodeData;
    const startDate = '1404/03/09 00:00:00';
    const endDate = '1404/03/10 00:00:00';

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
    if (!this.map) {
      console.error('Map is not initialized');
      return; // اگر نقشه مقداردهی نشده است، تابع را متوقف کنید
    }

    this.apiData.forEach((location, index) => {
      const icon = this.getMarkerIcon(index, location.DurationInSeconds);
      const tooltip = this.generateTooltipContent(location);

      const marker = L.marker([location.Latitude, location.Longitude], { icon });
      marker.addTo(this.map)  // اضافه کردن مارکر به نقشه
        .bindTooltip(tooltip, {
          direction: 'top',
          sticky: true,
          opacity: 0.95
        });
    });
  }


  drawPolyline(): void {
    const latlngs = this.apiData.map(loc => [loc.Latitude, loc.Longitude]) as [number, number][];
    L.polyline(latlngs, {
      color: 'blue',
      weight: 4,
      opacity: 0.7,
      dashArray: '5,10'
    }).addTo(this.map!);
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
