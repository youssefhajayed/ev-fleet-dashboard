import { Injectable } from '@angular/core';
import { interval } from 'rxjs';
import { Store } from '@ngrx/store';
import { updateVehicle, initializeVehicles } from '../state/vehicle.actions';
import { Vehicle } from '../models/vehicle.model';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private vehiclePositions: { [key: number]: { lat: number, lng: number } } = {};

  constructor(private store: Store) {
    console.log('wesocket construct');
    this.initializeVehicles();
    this.startSimulatingData();
  }

  private initializeVehicles() {
    const vehicles: Vehicle[] = [];
    console.log('initializing vehicles');

    for (let i = 1; i <= 10; i++) {
      const position = {
        lat: 48.8566 + Math.random() * 0.01,
        lng: 2.3522 + Math.random() * 0.01
      };
      this.vehiclePositions[i] = position;
      
      vehicles.push({
        id: i,
        speed: Math.floor(Math.random() * 100),
        battery: 100,
        temperature: Math.floor(Math.random() * (90 - 20 + 1)) + 20,
        tirePressure: Math.floor(Math.random() * (40 - 30 + 1)) + 30,
        motorEfficiency: Math.floor(Math.random() * (100 - 70 + 1)) + 70,
        regenBraking: Math.random() > 0.5,
        brakeWear: Math.floor(Math.random() * 100),
        energyConsumption: Math.floor(Math.random() * (20 - 5 + 1)) + 5,
        mileage: Math.floor(Math.random() * 100000),
        lidarStatus: Math.random() > 0.1,
        radarStatus: Math.random() > 0.1,
        cameraStatus: Math.random() > 0.1,
        autopilotMode: Math.random() > 0.5,
        location: position
      });
    }
    console.log('📡 Sending Vehicles Data:', vehicles);
    this.store.dispatch(initializeVehicles({ vehicles }));
  }

  private startSimulatingData() {
    interval(2000).subscribe(() => {
      for (let i = 1; i <= 10; i++) {
        let position = { ...this.vehiclePositions[i] };

        position.lat += (Math.random() - 0.5) * 0.001;
        position.lng += (Math.random() - 0.5) * 0.001;

        const updatedVehicle: Vehicle = {
          id: i,
          speed: Math.floor(Math.random() * 100),
          battery: Math.floor(Math.max(0, 100 - Math.random() * 40)),
          temperature: Math.floor(Math.random() * (90 - 20 + 1)) + 20,
          tirePressure: Math.floor(Math.random() * (40 - 30 + 1)) + 30,
          motorEfficiency: Math.floor(Math.random() * (100 - 70 + 1)) + 70,
          regenBraking: Math.random() > 0.5,
          brakeWear: Math.floor(Math.random() * 100),
          energyConsumption: Math.floor(Math.random() * (20 - 5 + 1)) + 5,
          mileage: Math.floor(Math.random() * 100000),
          lidarStatus: Math.random() > 0.1,
          radarStatus: Math.random() > 0.1,
          cameraStatus: Math.random() > 0.1,
          autopilotMode: Math.random() > 0.5,
          location: position
        };

        // ✅ Store the new position to maintain consistent state
        this.vehiclePositions[i] = position;
        console.log('📡 Sending Simulated Data:', updatedVehicle);
        this.store.dispatch(updateVehicle({ vehicle: updatedVehicle }));
      }
    });
  }
}
