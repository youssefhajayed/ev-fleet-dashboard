import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { GoogleMapsModule } from '@angular/google-maps';
import { WebSocketService } from '../../services/websocket.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  vehicles: any[] = [];
  mapCenter = { lat: 48.8566, lng: 2.3522 };

  constructor(private wsService: WebSocketService) {}

  ngOnInit() {
    this.wsService.getTelemetryData().subscribe({
      next: (data) => {
        console.log('📥 Received Data:', data);
        this.vehicles = [...data]; 
        this.updateMapCenter();
      },
      error: (err) => console.error('❌ WebSocket Error:', err)
    });
  }

  private updateMapCenter() {
    if (this.vehicles.length === 0) return;

    let sumLat = 0, sumLng = 0;
    this.vehicles.forEach(vehicle => {
      sumLat += vehicle.location.lat;
      sumLng += vehicle.location.lng;
    });

    this.mapCenter = {
      lat: sumLat / this.vehicles.length,
      lng: sumLng / this.vehicles.length
    };

    console.log('📍 Map Center Updated:', this.mapCenter);
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
