import { Injectable } from '@angular/core';
import { Observable, interval, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private dataStream$: Subject<any> = new Subject();
  private vehiclePositions: { [key: number]: { lat: number, lng: number } } = {}; // Store vehicle positions

  constructor() {
    this.initializeVehicles();
    this.startSimulatingData();
  }

  private initializeVehicles() {
    for (let i = 1; i <= 10; i++) {
      this.vehiclePositions[i] = { 
        lat: 48.8566 + Math.random() * 0.01, 
        lng: 2.3522 + Math.random() * 0.01 
      };
    }
  }

  private startSimulatingData() {
    interval(2000).subscribe(() => {
      const simulatedData = this.generateVehicleData();
      console.log('📡 Sending Simulated Data:', simulatedData);
      this.dataStream$.next(simulatedData);
    });
  }

  private generateVehicleData() {
    return Array.from({ length: 10 }, (_, i) => {
      const id = i + 1;
      let position = this.vehiclePositions[id];

      // Simulate small movements
      position.lat += (Math.random() - 0.5) * 0.0005;
      position.lng += (Math.random() - 0.5) * 0.0005;
      this.vehiclePositions[id] = position;

      return {
        id,
        speed: Math.floor(Math.random() * 100), 
        battery: Math.max(0, 100 - Math.random() * 5), 
        location: { lat: position.lat, lng: position.lng }
      };
    });
  }

  public getTelemetryData(): Observable<any> {
    return this.dataStream$.asObservable();
  }

  getMarkerIcon(vehicle: any): string {
    if (vehicle.battery > 70) {
      return 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'; // High battery = Green
    } else if (vehicle.battery > 30) {
      return 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png'; // Medium battery = Yellow
    } else {
      return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'; // Low battery = Red
    }
  }
}
