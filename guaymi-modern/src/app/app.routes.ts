import { Routes } from '@angular/router';
import {
  AboutPageComponent,
  ContactPageComponent,
  DestinationsPageComponent,
  HomePageComponent,
  ReservationPageComponent,
  ServicesPageComponent,
  TestimonialsPageComponent
} from './pages';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomePageComponent },
  { path: 'services', component: ServicesPageComponent },
  { path: 'destinations', component: DestinationsPageComponent },
  { path: 'testimonials', component: TestimonialsPageComponent },
  { path: 'reservation', component: ReservationPageComponent },
  { path: 'about-us', component: AboutPageComponent },
  { path: 'contact-us', component: ContactPageComponent },
  { path: '**', redirectTo: 'home' }
];
