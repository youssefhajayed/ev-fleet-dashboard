// app.state.ts
import { VehicleState } from './vehicle.reducer';

export interface AppState {
  vehicles: VehicleState; 
  // you can have other slices here, e.g. 'auth', 'users', etc.
}
