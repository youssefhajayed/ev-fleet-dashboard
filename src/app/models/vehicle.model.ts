export interface Vehicle {
    id: number;
    speed: number;                   // Speed in km/h
    battery: number;                  // Battery level in %
    temperature: number;               // Battery temperature in °C
    tirePressure: number;              // Tire pressure in PSI
    motorEfficiency: number;           // Motor efficiency in %
    regenBraking: boolean;             // Regenerative braking status (ON/OFF)
    brakeWear: number;                 // Brake wear level in %
    energyConsumption: number;         // Energy consumption in kWh
    mileage: number;                   // Total mileage in km
    lidarStatus: boolean;              // LIDAR sensor status (active/inactive)
    radarStatus: boolean;              // RADAR sensor status (active/inactive)
    cameraStatus: boolean;             // Camera sensor status (active/inactive)
    autopilotMode: boolean;            // Whether the vehicle is in self-driving mode
    location: { lat: number; lng: number }; // GPS location
  }
  