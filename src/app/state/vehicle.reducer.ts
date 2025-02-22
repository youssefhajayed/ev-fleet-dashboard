import { createReducer, on } from '@ngrx/store';
import { initializeVehicles, updateVehicle } from './vehicle.actions';
import { Vehicle } from '../models/vehicle.model';

export interface VehicleState {
  vehicles: { [id: number]: Vehicle }; // Store vehicles by ID
}

export const initialState: VehicleState = {
  vehicles: {}
};

export const vehicleReducer = createReducer(
  initialState,

  // Debug initializeVehicles
  on(initializeVehicles, (state, { vehicles }) => {
    console.log('✅ Reducer: Initializing Vehicles', vehicles);

    const vehicleMap = vehicles.reduce((map, vehicle) => {
      map[vehicle.id] = vehicle;
      return map;
    }, {} as { [id: number]: Vehicle });

    console.log('✅ New State:', { vehicles: vehicleMap });

    return { vehicles: vehicleMap };
  }),

  // Debug updateVehicle
  on(updateVehicle, (state, { vehicle }) => {
    console.log('🚀 Reducer: Updating Vehicle', vehicle);

    const existingVehicle = state.vehicles[vehicle.id];

    return {
      vehicles: {
        ...state.vehicles,
        [vehicle.id]: {
          ...vehicle,
          battery: existingVehicle
            ? Math.min(existingVehicle.battery, vehicle.battery) // Battery cannot increase
            : vehicle.battery
        }
      }
    };
  })
);
