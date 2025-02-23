// web-socket.service.ts
import { Injectable } from '@angular/core';
import { interval, map, Subject, switchMap, take, tap } from 'rxjs';
import { Store } from '@ngrx/store';
import { initializeVehicles, updateVehicle } from '../state/vehicle.actions';
import { Vehicle, CarStatusType } from '../models/vehicle.model';
import { AppState } from '../state/app.state'; // <-- Root AppState interface
import { selectVehiclesMap } from '../state/vehicle.selectors'

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private vehiclePositions: Record<number, { lat: number; lng: number }> = {};
  private chargingVehicles = new Set<number>(); // Track charging vehicles
  private readonly CHARGING_STATION = { lat: 48.857, lng: 2.351 }; // Charging location
  private readonly MAX_BATTERY = 100;
  private readonly SIMULATION_INTERVAL = 2000; // 2 seconds
  private destroy$ = new Subject<void>(); // ✅ Emits when service is destroyed

  // Inject Store<AppState>, not Store<VehicleState>
  constructor(private store: Store<AppState>) {
    this.initializeVehicles();
    this.startSimulatingData();
  }

  private initializeVehicles() {
    const vehicles: Vehicle[] = Array.from({ length: 10 }, (_, i) => {
      const id = i + 1;
      this.vehiclePositions[id] = this.getRandomPosition();
      return this.generateVehicle(id);
    });

    this.store.dispatch(initializeVehicles({ vehicles }));
  }

  private startSimulatingData() {
    interval(this.SIMULATION_INTERVAL)
      .pipe(
        // Use our typed selector instead of (state: any) => state.vehicles.vehicles
        switchMap(() =>
          this.store.select(selectVehiclesMap).pipe(
            take(1) // only take once each interval
          )
        ),
        map(vehicleMap => {
          // vehicleMap is now correctly typed as Record<number, Vehicle>
          return Object.values(vehicleMap).map(vehicle=>
            this.updateVehicleState(vehicle)
          );
        }),
        tap(updatedVehicles => {
          updatedVehicles.forEach(vehicle =>
            this.store.dispatch(updateVehicle({ vehicle }))
          );
        })
      )
      .subscribe();
  }

  private updateVehicleState(vehicle: Vehicle): Vehicle {
    let position = { ...this.vehiclePositions[vehicle.id] };
    let newBattery = vehicle.battery;
    let newSpeed = vehicle.speed;
    let carStatus = vehicle.carStatus;
    const isCharging = this.chargingVehicles.has(vehicle.id);


    // 🔋 Charging Logic
    if (isCharging) {
      console.log("battery is charging")
      return this.chargeVehicle(vehicle);
    }

    // 🛑 Battery 0: Teleport & Charge
    if (newBattery <= 0) {
      console.log("battery is < 0")
      return this.handleBatteryDepleted(vehicle);
    }
        // 🚗 Normal Driving & Drain Battery
    position = this.updatePosition(position);
    newBattery = this.drainBattery(newBattery);
    newSpeed = this.getRandomSpeed();
    carStatus = 'Moving';

    return this.generateVehicle(vehicle.id, newSpeed, newBattery, position, carStatus);
  }

  private handleBatteryDepleted(vehicle: Vehicle): Vehicle {
    this.chargingVehicles.add(vehicle.id);
    return this.generateVehicle(
      vehicle.id,
      0,
      0,
      this.getLineupPosition(vehicle.id),
      'Charging'
    );
    
  }

  private chargeVehicle(vehicle: Vehicle): Vehicle {
    console.log(this.MAX_BATTERY)
    const newBattery = Math.min(this.MAX_BATTERY, vehicle.battery + 20);
    let position = this.getLineupPosition(vehicle.id);
    let carStatus: CarStatusType = 'Charging';

    if (newBattery === this.MAX_BATTERY) {
      this.chargingVehicles.delete(vehicle.id);
      position = this.getRandomPosition();
      carStatus = 'Idle';
    }

    return this.generateVehicle(vehicle.id, 0, newBattery, position, carStatus);
  }

  private updatePosition(position: { lat: number; lng: number }): { lat: number; lng: number } {
    return {
      lat: position.lat + (Math.random() - 0.5) * 0.0005,
      lng: position.lng + (Math.random() - 0.5) * 0.0005,
    };
  }

  private drainBattery(currentBattery: number): number {
    return Math.max(0, currentBattery - (Math.floor(Math.random() * 20) + 1));
  }

  private getRandomSpeed(): number {
    return Math.floor(Math.random() * 100);
  }

  private getLineupPosition(vehicleId: number): { lat: number; lng: number } {
    return {
      lat: this.CHARGING_STATION.lat + 0.00005 * (vehicleId - 1),
      lng: this.CHARGING_STATION.lng,
    };
  }

  private getRandomPosition(): { lat: number; lng: number } {
    return {
      lat: 48.8566 + Math.random() * 0.01,
      lng: 2.3522 + Math.random() * 0.01,
    };
  }

  private generateVehicle(
    id?: number,
    newSpeed?: number,
    newBattery?: number,
    position?: { lat: number; lng: number },
    carStatus?: CarStatusType
  ): Vehicle {
    return {
      id: id ?? Math.floor(Math.random() * 10000),
      speed: newSpeed ?? this.getRandomSpeed(),
      battery: newBattery ?? this.MAX_BATTERY,
      temperature: Math.floor(Math.random() * 70) + 20,
      tirePressure: Math.floor(Math.random() * 10) + 30,
      motorEfficiency: Math.floor(Math.random() * 31) + 70,
      regenBraking: Math.random() > 0.5,
      brakeWear: Math.floor(Math.random() * 100),
      energyConsumption: Math.floor(Math.random() * 16) + 5,
      mileage: Math.floor(Math.random() * 100000),
      lidarStatus: Math.random() > 0.1,
      radarStatus: Math.random() > 0.1,
      cameraStatus: Math.random() > 0.1,
      autopilotMode: Math.random() > 0.5,
      location: position ?? this.getRandomPosition(),
      carStatus: carStatus ?? 'Moving',
    };
  }
}
