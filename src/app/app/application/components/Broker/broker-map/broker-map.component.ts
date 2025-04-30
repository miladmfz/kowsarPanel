import { Component, Input, OnInit } from '@angular/core';
import * as L from 'leaflet';
@Component({
  selector: 'app-broker-map',
  templateUrl: './broker-map.component.html',
})
export class BrokerMapComponent implements OnInit {

  map: L.Map | undefined;

  @Input() BrokerCodeData: string = '';

  apiData = [
    { "GpsLocationCode": 346995, "Longitude": 51.3686215, "Latitude": 35.7053458, "BrokerRef": 1, "GpsDate": "1404/03/09 11:00:12", "NextGpsDate": "1404/03/09 11:00:12", "DurationInSeconds": 0 },
    { "GpsLocationCode": 346997, "Longitude": 51.3685996, "Latitude": 35.7053405, "BrokerRef": 1, "GpsDate": "1404/03/09 11:00:42", "NextGpsDate": "1404/03/09 11:00:42", "DurationInSeconds": 0 },
    { "GpsLocationCode": 346998, "Longitude": 51.3686101, "Latitude": 35.7053397, "BrokerRef": 1, "GpsDate": "1404/03/09 11:00:57", "NextGpsDate": "1404/03/09 11:00:57", "DurationInSeconds": 0 },
    { "GpsLocationCode": 346999, "Longitude": 51.3685936, "Latitude": 35.7053378, "BrokerRef": 1, "GpsDate": "1404/03/09 11:01:12", "NextGpsDate": "1404/03/09 11:01:12", "DurationInSeconds": 0 },
    { "GpsLocationCode": 347000, "Longitude": 51.3685854, "Latitude": 35.7053135, "BrokerRef": 1, "GpsDate": "1404/03/09 11:01:27", "NextGpsDate": "1404/03/09 11:01:27", "DurationInSeconds": 0 },
    { "GpsLocationCode": 347016, "Longitude": 51.3686004, "Latitude": 35.7053332, "BrokerRef": 1, "GpsDate": "1404/03/09 11:00:27", "NextGpsDate": "1404/03/09 11:00:27", "DurationInSeconds": 0 }
  ];


  constructor() { }

  ngOnInit(): void {
    this.initializeMap();
    this.addMarkers();
  }



  initializeMap(): void {
    this.map = L.map('map', {
      center: [35.7053458, 51.3686215], // موقعیت مرکز نقشه
      zoom: 13, // میزان زوم اولیه
      zoomControl: false,  // مخفی کردن دکمه‌های زوم
      attributionControl: false, // مخفی کردن نوشته‌های اعتبار نقشه
      scrollWheelZoom: false  // غیرفعال کردن تغییر مقیاس با اسکرول موس
    });

    // اضافه کردن لایه OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,   // حداکثر زوم
      minZoom: 10,   // حداقل زوم
      noWrap: true    // جلوگیری از برش نقشه در مرزها
    })
      .on('tileload', (e) => {
        console.log('کاشی بارگذاری شد:', e.tile);
      })
      .on('load', () => {
        console.log('تمام کاشی‌ها بارگذاری شدند');
      })
      .addTo(this.map);

    this.map.on('tileload', (e: any) => {
      console.log('کاشی بارگذاری شد:', e.tile);
    });
  }

  addMarkers(): void {
    this.apiData.forEach(location => {
      const { Longitude, Latitude, GpsLocationCode } = location;
      L.marker([Latitude, Longitude]).addTo(this.map!)
        .bindPopup(`GpsLocationCode: ${GpsLocationCode}`)
        .openPopup();
    });
  }
}


