import { createReducer, on } from '@ngrx/store';
import { initializeVehicles, updateVehicle } from './vehicle.actions';
import { Vehicle } from '../models/vehicle.model';

export interface VehicleState {
  vehicles: { [id: number]: Vehicle }; // Store vehicles by ID
}

export const initialState: VehicleState = {
  vehicles: {},
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
    const existingVehicle = state.vehicles[vehicle.id];
  
    return {
      vehicles: {
        ...state.vehicles,
        [vehicle.id]: {
          // If we want to keep the rest of the old vehicle's fields
          ...existingVehicle,
          // Overwrite them with what's in the action
          ...vehicle,
  
          // (Optional) clamp if you never want battery below 0 or above 100
          battery: Math.min(100, Math.max(0, vehicle.battery)),
        },
      },
    };
  })
);
