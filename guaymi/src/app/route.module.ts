import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { ReservationComponent } from './reservation/reservation.component';
import { DestinationsComponent } from './destinations/destinations.component';

const appRoutes: Routes = [
  { path: "", redirectTo: "home", pathMatch: "full" },
  { path: "home", component: HomeComponent },
  { path: "about-us", component: AboutUsComponent },
  { path: "contact-us", component: ContactUsComponent },
  { path: "reservation", component: ReservationComponent },
  { path: "destinations", component: DestinationsComponent }
]

@NgModule({
  exports: [RouterModule],
  imports: [
    RouterModule.forRoot(appRoutes)
  ],
})
export class RouteModule { }