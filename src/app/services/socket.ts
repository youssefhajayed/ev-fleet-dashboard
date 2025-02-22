import { Injectable } from '@angular/core';
import { interval, take } from 'rxjs';
import { Store } from '@ngrx/store';
import { updateVehicle, initializeVehicles } from '../state/vehicle.actions';
import { Vehicle } from '../models/vehicle.model';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private vehiclePositions: { [key: number]: { lat: number, lng: number } } = {};
  private chargingVehicles: Set<number> = new Set(); // Track vehicles currently charging
  private readonly CHARGING_STATION = { lat: 48.857, lng: 2.351 }; // Charging location

  constructor(private store: Store<{ vehicles: { [id: number]: Vehicle } }>) {
    console.log('🟢 WebSocket Service Initialized');
    this.initializeVehicles();
    this.startSimulatingData();
  }

  private initializeVehicles() {
    const vehicles: Vehicle[] = [];
    console.log('🟡 Initializing Vehicles');

    for (let i = 1; i <= 10; i++) {
      const position = {
        lat: 48.8566 + Math.random() * 0.01,
        lng: 2.3522 + Math.random() * 0.01
      };
      this.vehiclePositions[i] = position;

      vehicles.push({
        id: i,
        speed: Math.floor(Math.random() * 50) + 20,
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

    console.log('📡 Dispatching Initial Vehicles:', vehicles);
    this.store.dispatch(initializeVehicles({ vehicles }));
  }

  private startSimulatingData() {
    interval(2000).subscribe(() => {
      this.store.select(state => state.vehicles).pipe(take(1)).subscribe(vehicles => {
        const updatedVehicles: Vehicle[] = [];

        for (let i = 1; i <= 10; i++) {
          let position = { ...this.vehiclePositions[i] };
          const previousVehicle = vehicles[i] || { battery: 100, speed: 30, mileage: 0 };

          let newBattery = previousVehicle.battery;
          let newSpeed = previousVehicle.speed;
          let isCharging = this.chargingVehicles.has(i);

          // 🚗 1. If the battery is 10% and not already charging, move towards the charging station
          if (newBattery <= 10 && !isCharging) {
            this.chargingVehicles.add(i); // Start tracking as charging
            console.log(`⚡ Vehicle ${i} moving to charging station`);
          }

          // ⚡ 2. If charging, move vehicle to the charging station
          if (isCharging) {
            position = this.moveTowards(position, this.CHARGING_STATION);
            newSpeed = 10; // Slow speed while moving to charge

            // 🚧 3. Once at charging station, start charging
            if (this.hasReachedChargingStation(position)) {
              newBattery = Math.min(100, newBattery + 5); // Charge up to 100%
              newSpeed = 0; // Stop the vehicle

              // 🔋 4. If fully charged, resume normal movement
              if (newBattery === 100) {
                this.chargingVehicles.delete(i);
                console.log(`✅ Vehicle ${i} fully charged and resuming movement`);
              }
            }
          } else {
            // 🏎️ 5. Normal movement (randomized)
            position.lat += (Math.random() - 0.5) * 0.0005;
            position.lng += (Math.random() - 0.5) * 0.0005;
            newBattery = Math.max(0, newBattery - (Math.random() * 2)); // Gradual drain
          }

          // ✅ Update the vehicle state
          const updatedVehicle: Vehicle = {
            ...previousVehicle,
            speed: Math.floor(newSpeed),
            battery: Math.floor(newBattery),
            location: position
          };

          this.vehiclePositions[i] = position;
          updatedVehicles.push(updatedVehicle);
        }

        console.log('📡 Dispatching Updated Vehicles:', updatedVehicles);
        updatedVehicles.forEach(vehicle => {
          this.store.dispatch(updateVehicle({ vehicle }));
        });
      });
    });
  }

  // 🚗 Move a vehicle gradually toward the charging station
  private moveTowards(position: { lat: number, lng: number }, target: { lat: number, lng: number }) {
    const step = 0.0005; // Speed of movement

    const directionLat = target.lat - position.lat;
    const directionLng = target.lng - position.lng;

    position.lat += directionLat * step;
    position.lng += directionLng * step;

    return position;
  }

  // 🏁 Check if vehicle reached the charging station
  private hasReachedChargingStation(position: { lat: number, lng: number }) {
    const distance = Math.sqrt(
      Math.pow(this.CHARGING_STATION.lat - position.lat, 2) +
      Math.pow(this.CHARGING_STATION.lng - position.lng, 2)
    );

    return distance < 0.0001; // Small threshold to consider it "arrived"
  }
}
