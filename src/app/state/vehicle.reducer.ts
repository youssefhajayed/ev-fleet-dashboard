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

  on(initializeVehicles, (state, { vehicles }) => {
    const vehicleMap = vehicles.reduce((map, vehicle) => {
      map[vehicle.id] = vehicle;
      return map;
    }, {} as { [id: number]: Vehicle });
    return { vehicles: vehicleMap };
  }),

  on(updateVehicle, (state, { vehicle }) => {
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
