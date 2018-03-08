import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { MenuComponent } from './menu/menu.component';
import { FooterComponent } from './footer/footer.component';
import { RouteModule } from './route.module';
import { HomeComponent } from './home/home.component';
import { ShuttleComponent } from './shuttle/shuttle.component';
import { AboutUsComponent } from './about-us/about-us.component'
import { AlertModule } from 'ngx-bootstrap';
import { CarouselModule, TimepickerModule, TooltipModule } from 'ngx-bootstrap';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker/bs-datepicker.module';
import { ReservationComponent } from './reservation/reservation.component';
import { FormsModule } from '@angular/forms';
import { ReservationService } from './services/reservation.service';
import { DestinationsComponent } from './destinations/destinations.component';
import { PlaceDetailComponent } from './place-detail/place-detail.component';
import { Ng4GeoautocompleteModule } from './places-autocomplete';


@NgModule({
  declarations: [
    AppComponent,
    MenuComponent,
    FooterComponent,
    HomeComponent,
    ShuttleComponent,
    AboutUsComponent,
    ContactUsComponent,
    ReservationComponent,
    DestinationsComponent,
    PlaceDetailComponent
  ],
  imports: [
    BrowserModule,
    RouteModule,
    FormsModule,
    HttpClientModule,
    HttpModule,
    AlertModule.forRoot(),
    CarouselModule.forRoot(),
    BsDatepickerModule.forRoot(),
    TooltipModule.forRoot(),
    TimepickerModule.forRoot(),
    Ng4GeoautocompleteModule.forRoot()
  ],
  entryComponents: [ShuttleComponent],
  providers: [ReservationService],
  bootstrap: [AppComponent]
})
export class AppModule { }
