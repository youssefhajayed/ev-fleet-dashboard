import { Component } from '@angular/core';
import { DashboardComponent } from './components/dashboard/dashboard.component'; // ✅ Import it
import { GoogleMapsModule } from '@angular/google-maps';

@Component({
  selector: 'app-root',
  standalone: true, // ✅ Ensure it's standalone
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [DashboardComponent, GoogleMapsModule] // ✅ Add DashboardComponent here
})
export class AppComponent {
  title = 'EV Fleet Dashboard';
}
