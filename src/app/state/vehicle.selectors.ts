// vehicle.selectors.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { VehicleState } from './vehicle.reducer';

// 1) Select the entire Vehicle feature slice from AppState.
//    The string 'vehicles' must match the name used when you provide
//    vehicleReducer in your StoreModule.forRoot(...) or forFeature(...).
export const selectVehicleState =
  createFeatureSelector<VehicleState>('vehicles');

// 2) Create a selector that returns the `vehicles` map from VehicleState.
export const selectVehiclesMap = createSelector(
  selectVehicleState,
  (state: VehicleState) => state.vehicles
);
