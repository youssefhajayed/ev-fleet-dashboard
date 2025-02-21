import { createAction, props } from '@ngrx/store';
import { Vehicle } from '../models/vehicle.model';

// Initialize vehicles
export const initializeVehicles = createAction(
  '[Vehicle] Initialize',
  props<{ vehicles: Vehicle[] }>()
);

// Update a single vehicle
export const updateVehicle = createAction(
  '[Vehicle] Update',
  props<{ vehicle: Vehicle }>()
);
