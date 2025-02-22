import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { VehicleState } from '../../state/vehicle.reducer';
import { Observable } from 'rxjs';
import { Vehicle } from '../../models/vehicle.model';
import { GoogleMapsModule } from '@angular/google-maps';
import { CommonModule } from '@angular/common';
import { WebSocketService } from '../../services/websocket.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  providers: [WebSocketService] // ✅ Ensure service is provided
})
export class DashboardComponent {
  vehicles$: Observable<{ [id: number]: Vehicle }>;
  mapCenter = { lat: 48.8566, lng: 2.3522 }; // Default center (Paris)
  private isFirstLoad = true; // ✅ Track if this is the first load

  constructor(private store: Store<{ vehicles: VehicleState }>, private wsService: WebSocketService) {
    
    console.log('🟡 Subscribing to Vehicles State');
    this.vehicles$ = store.select(state => {
      console.log('🚀 Vehicles in Store:', state.vehicles.vehicles);
      return state.vehicles.vehicles;
    });
  }

  ngOnInit() {
    this.vehicles$.subscribe(vehicles => {
      const vehicleList = Object.values(vehicles);
      if (vehicleList.length > 0 && this.isFirstLoad) {
        this.centerMapOnVehicles(vehicleList);
        this.isFirstLoad = false;
      }
    });
  }

  private centerMapOnVehicles(vehicles: Vehicle[]) {
    let sumLat = 0, sumLng = 0;
    vehicles.forEach(vehicle => {
      sumLat += vehicle.location.lat;
      sumLng += vehicle.location.lng;
    });

    this.mapCenter = {
      lat: sumLat / vehicles.length,
      lng: sumLng / vehicles.length
    };
  }

  getUniqueMarkerIcon(vehicleId: number): google.maps.Icon {
    const vehicleIcons = [
      'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
      'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
      'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
      'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
      'https://maps.google.com/mapfiles/ms/icons/purple-dot.png'
    ];

    return {
      url: vehicleIcons[vehicleId % vehicleIcons.length], 
      scaledSize: new google.maps.Size(40, 40), 
    };
  }
}
