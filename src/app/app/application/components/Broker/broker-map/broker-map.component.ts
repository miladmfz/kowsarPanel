import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import * as L from 'leaflet';
@Component({
  selector: 'app-broker-map',
  templateUrl: './broker-map.component.html',
  styleUrls: ['./broker-map.component.css']

})
export class BrokerMapComponent implements AfterViewInit {

  map: L.Map | undefined;

  @Input() BrokerCodeData: string = '';



  apiData = [
    { "GpsLocationCode": 346995, "Longitude": 51.376441, "Latitude": 35.705478, "BrokerRef": 1, "GpsDate": "1404/03/09 11:00:12", "NextGpsDate": "1404/03/09 11:00:12", "DurationInSeconds": 0 },
    { "GpsLocationCode": 346997, "Longitude": 51.375468, "Latitude": 35.705473, "BrokerRef": 1, "GpsDate": "1404/03/09 11:00:42", "NextGpsDate": "1404/03/09 11:00:42", "DurationInSeconds": 0 },
    { "GpsLocationCode": 346998, "Longitude": 51.374408, "Latitude": 35.705426, "BrokerRef": 1, "GpsDate": "1404/03/09 11:00:57", "NextGpsDate": "1404/03/09 11:00:57", "DurationInSeconds": 1000 },
    { "GpsLocationCode": 346999, "Longitude": 51.373531, "Latitude": 35.705436, "BrokerRef": 1, "GpsDate": "1404/03/09 11:01:12", "NextGpsDate": "1404/03/09 11:01:12", "DurationInSeconds": 0 },
    { "GpsLocationCode": 347000, "Longitude": 51.372464, "Latitude": 35.705400, "BrokerRef": 1, "GpsDate": "1404/03/09 11:01:27", "NextGpsDate": "1404/03/09 11:01:27", "DurationInSeconds": 1000 },
    { "GpsLocationCode": 347016, "Longitude": 51.371353, "Latitude": 35.705412, "BrokerRef": 1, "GpsDate": "1404/03/09 11:00:27", "NextGpsDate": "1404/03/09 11:00:27", "DurationInSeconds": 0 }
  ];


  ngAfterViewInit(): void {
    this.initializeMap();
    this.map!.whenReady(() => {
      this.addMarkers();
    });
  }



  initializeMap(): void {
    this.map = L.map('map', {
      center: [35.7053458, 51.3686215],
      zoom: 13,
      zoomControl: true,
      scrollWheelZoom: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 17,
      minZoom: 11,
      noWrap: true
    }).addTo(this.map);

    setTimeout(() => {
      this.map?.invalidateSize();
    }, 0);

    this.map.getContainer().addEventListener('wheel', (e: WheelEvent) => {
      if (!e.ctrlKey) {
        e.preventDefault();
      }
    }, { passive: false });

    console.log(document.getElementById('map').clientWidth)
    console.log(document.getElementById('map').clientHeight)



  }


  addMarkers(): void {



    this.apiData.forEach((location, index) => {
      const { Longitude, Latitude, GpsLocationCode, BrokerRef, GpsDate, NextGpsDate, DurationInSeconds } = location;

      // Customize marker size and border color based on DurationInSeconds


      let iconUrlToUse;

      if (index === 0) {
        iconUrlToUse = 'assets/images/start.png';  // first point
      } else if (index === this.apiData.length - 1) {
        iconUrlToUse = 'assets/images/end.png';  // last point
      } else if (DurationInSeconds > 100) {
        iconUrlToUse = 'assets/images/person.png';
      } else {
        iconUrlToUse = 'assets/images/location.png';
      }

      let iconSize;
      let iconAnchor;

      if (index === 0 || index === this.apiData.length - 1) {
        iconSize = [50, 50];
        iconAnchor = [25, 50];
      } else if (DurationInSeconds > 900) {
        iconSize = [50, 50];
        iconAnchor = [25, 50];
      } else {
        iconSize = [24, 24];
        iconAnchor = [12, 24];
      }



      const customIcon = L.icon({
        iconUrl: iconUrlToUse,
        iconSize: iconSize,
        iconAnchor: iconAnchor,
        popupAnchor: [0, -40],
        tooltipAnchor: [0, -40],
        shadowSize: [41, 41]
      });


      const tooltipContent = `
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
          <div><b style="color: #4A90E2;">GpsLocationCode:</b></div>
          <div style="text-align: right;">${GpsLocationCode}</div>
  
          <div><b style="color: #50E3C2;">BrokerRef:</b></div>
          <div style="text-align: right;">${BrokerRef}</div>
  
          <div><b style="color: #F5A623;">GpsDate:</b></div>
          <div style="text-align: right;">${GpsDate}</div>
  
          <div><b style="color: #F8E71C;">NextGpsDate:</b></div>
          <div style="text-align: right;">${NextGpsDate}</div>
  
          <div><b style="color: #D0021B;">Duration:</b></div>
          <div style="text-align: right;">${DurationInSeconds} s</div>
        </div>
      `;

      const popupContent = `
        <div style="
          font-size: 14px;
          font-weight: bold;
          padding: 6px;
          color: #333;
          display: flex;
          flex-direction: column;
        ">
          <div><b>GpsLocationCode:</b> ${GpsLocationCode}</div>
          <div><b>BrokerRef:</b> ${BrokerRef}</div>
        </div>
      `;

      // Create and add the marker with custom icon
      L.marker([Latitude, Longitude], { icon: customIcon })
        .addTo(this.map!)
        .bindPopup(popupContent)
        .bindTooltip(tooltipContent, {
          direction: 'top',
          sticky: true,
          opacity: 0.95
        });
    });


    // بعد از حلقه forEach
    const latlngs: [number, number][] = this.apiData.map(location => [location.Latitude, location.Longitude]);

    L.polyline(latlngs, {
      color: 'blue',
      weight: 4,
      opacity: 0.7,
      dashArray: '5, 10'  // اختیاری، برای خط‌چین
    }).addTo(this.map);


  }

}
