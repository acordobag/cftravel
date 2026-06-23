import { Routes } from '@angular/router';


import { AdminPageComponent } from './admin-pages';
import { AccountPageComponent } from './account-page';
import { ChangePasswordPageComponent, LoginPageComponent, SignupPageComponent } from './auth-pages';
import { authGuard, privilegedGuard } from './auth.guard';
import {
  AboutPageComponent,
  ContactPageComponent,
  DestinationsPageComponent,
  FleetPageComponent,
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
  { path: 'fleet', component: FleetPageComponent },
  { path: 'testimonials', component: TestimonialsPageComponent },
  { path: 'reservation', component: ReservationPageComponent },
  { path: 'about-us', component: AboutPageComponent },
  { path: 'contact-us', component: ContactPageComponent },
  { path: 'login', component: LoginPageComponent },
  { path: 'signup', component: SignupPageComponent },
  { path: 'change-password', component: ChangePasswordPageComponent, canActivate: [authGuard] },
  { path: 'account', component: AccountPageComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminPageComponent, canActivate: [privilegedGuard] },
  { path: '**', redirectTo: 'home' }
];
