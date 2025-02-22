import { Injectable } from '@angular/core';
import { interval, take } from 'rxjs';
import { Store } from '@ngrx/store';
import { updateVehicle, initializeVehicles } from '../state/vehicle.actions';
import { Vehicle } from '../models/vehicle.model';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private vehiclePositions: { [key: number]: { lat: number; lng: number } } = {};
  private chargingVehicles: Set<number> = new Set(); // Track vehicles currently charging
  private readonly CHARGING_STATION = { lat: 48.857, lng: 2.351 }; // Charging location

  constructor(private store: Store) {
    this.initializeVehicles();
    this.startSimulatingData();
  }

  private initializeVehicles() {
    const vehicles: Vehicle[] = [];

    for (let i = 1; i <= 10; i++) {
      const position = {
        lat: 48.8566 + Math.random() * 0.01,
        lng: 2.3522 + Math.random() * 0.01,
      };
      this.vehiclePositions[i] = position;

      vehicles.push({
        id: i,
        speed: Math.floor(Math.random() * 100),
        battery: 100, // or use a smaller random: Math.floor(Math.random()*50+50)
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
        location: position,
        carStatus: "Moving" 
      });
    }
    this.store.dispatch(initializeVehicles({ vehicles }));
  }

  private startSimulatingData() {
    interval(2000).subscribe(() => {
      this.store
        .select((state: any) => state.vehicles.vehicles)
        .pipe(take(1))
        .subscribe((vehicleMap: { [id: number]: Vehicle }) => {
          const updatedVehicles: Vehicle[] = [];
  
          for (let i = 1; i <= 10; i++) {
            let position = { ...this.vehiclePositions[i] };
            const previousVehicle = vehicleMap[i] ?? {
              battery: 100,
              speed: 30,
              mileage: 0,
            };
  
            let newBattery = previousVehicle.battery;
            let newSpeed = previousVehicle.speed;
            let headingToStation = previousVehicle.headingToStation || false;
            let carStatus = previousVehicle.carStatus
  
            const isCharging = this.chargingVehicles.has(i);
  
            // If battery <= 10 and > 0 => Mark for charging
            if (newBattery <= 10 && newBattery > 0 && !isCharging) {
              this.chargingVehicles.add(i);
              headingToStation = true;
              console.log(`⚡ Vehicle ${i} heading to charging station...`);
            }
  
            // ---------- 1) If battery 0 => teleport and partial recharge ----------
            if (newBattery <= 0) {
              newBattery = 0;
              newSpeed = 0;
              this.chargingVehicles.add(i);
  
              // Teleport next to station
              position = this.getLineupPosition(i);
              headingToStation = false;
  
              // Start recharging from 0 => +5
              newBattery = Math.min(100, newBattery + 10);
              if (newBattery === 100) {
                this.chargingVehicles.delete(i);
                console.log(`✅ Vehicle ${i} instantly recharged from 0%`);
              } else {
                console.log(`❌ Vehicle ${i} out of battery, teleported to station`);
              }
            }
            // ---------- 2) If in charging set and battery is between 1–99 ----------
            else if (isCharging) {
              // Are we physically at station yet?
              if (!this.hasReachedChargingStation(position)) {
                // Move toward station with a small drain
                // (So they can go from ~10% down to 0% in transit)
                position = this.moveTowards(position, this.CHARGING_STATION);
                newSpeed = 10;
  
                // Gently drain while en route
                newBattery = Math.max(
                  0,
                  newBattery - (Math.floor(Math.random() * 3) + 1)
                );
              } else {
                // ---------- PHYSICALLY AT STATION => ONLY RECHARGE! ----------
                newSpeed = 0;
                carStatus = "Charging";
                // Do NOT subtract battery if at station
                newBattery = Math.min(100, newBattery + 5);
  
                if (newBattery === 100) {
                  this.chargingVehicles.delete(i);
                  headingToStation = false;
                  position = this.getRandomPosition(i)
                  console.log(`✅ Vehicle ${i} fully charged at the station`);
                }
              }
            }
            // ---------- 3) Normal driving & random drain ----------
            else {
              position.lat += (Math.random() - 0.5) * 0.0005;
              position.lng += (Math.random() - 0.5) * 0.0005;
  
              // Drain up to 4% each tick for normal driving
              newBattery = Math.max(
                0,
                newBattery - (Math.floor(Math.random() * 20) + 1)
              );
            }
  
            // Build updated object
            const updatedVehicle: Vehicle = {
              ...previousVehicle,
              speed: newSpeed,
              battery: Math.floor(newBattery),
              location: position,
              headingToStation: headingToStation,
              carStatus : carStatus
            };
  
            this.vehiclePositions[i] = position;
            updatedVehicles.push(updatedVehicle);
            this.store.dispatch(updateVehicle({ vehicle: updatedVehicle }));
          }
        });
    });
  }

  // Line up near station
  private getLineupPosition(vehicleId: number) {
    const offset = 0.00005 * (vehicleId - 1);
    return {
      lat: this.CHARGING_STATION.lat + offset,
      lng: this.CHARGING_STATION.lng,
    };
  }

  private getRandomPosition(vehicleId: number) {
    // Define how far (in degrees) you allow the car to spawn from your station
    const maxOffset = 0.01;
  
    // Generate random offsets: somewhere between -0.01 and +0.01
    const latOffset = (Math.random() - 0.5) * 2 * maxOffset;
    const lngOffset = (Math.random() - 0.5) * 2 * maxOffset;
  
    return {
      // Station is at 48.857, 2.351 by default
      lat: 48.857 + latOffset,
      lng: 2.351 + lngOffset,
    };
  }

  private moveTowards(
    position: { lat: number; lng: number },
    target: { lat: number; lng: number }
  ) {
    const step = 0.0005;
    const directionLat = target.lat - position.lat;
    const directionLng = target.lng - position.lng;
    position.lat += directionLat * step;
    position.lng += directionLng * step;
    return position;
  }

  private hasReachedChargingStation(position: { lat: number; lng: number }) {
    const distance = Math.sqrt(
      Math.pow(this.CHARGING_STATION.lat - position.lat, 2) +
        Math.pow(this.CHARGING_STATION.lng - position.lng, 2)
    );
    return distance < 0.001;
  }
}
