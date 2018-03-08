import { Component, OnInit, Input } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map'
import { } from '@types/googlemaps';
import { BsDatepickerDirective } from 'ngx-bootstrap/datepicker';
import { BsDatepickerConfig } from 'ngx-bootstrap';
import { Router } from '@angular/router';
import { ReservationService } from '../services/reservation.service';
import { Shuttle, GmapPlace, backEndUrl, PriceObject } from '../entities/entities';
import { } from '@types/googlemaps';

@Component({
  selector: 'app-shuttle',
  templateUrl: './shuttle.component.html',
  styleUrls: ['./shuttle.component.css'],
  providers: [BsDatepickerDirective]
})
export class ShuttleComponent implements OnInit {

  @Input() type: number;
  @Input() number: number;
  colorTheme = 'theme-green';
  minDate: Date;
  bsConfig: Partial<BsDatepickerConfig>;
  userSettings: Object;
  @Input() shuttle: Shuttle = new Shuttle();
  directionService;

  constructor(private router: Router, private reservationService: ReservationService, private http: Http) { }

  ngOnInit() {
    this.userSettings = {
      "geoCountryRestriction": ["cr"],
      "showRecentSearch": false,
      "showSearchButton": false,
      "inputPlaceholderText": "",
      "showCurrentLocation": false
    }
    this.minDate = new Date();
    this.shuttle = new Shuttle();
    this.directionService = new google.maps.DirectionsService();
  }

  autoCompleteCallback(event, type) {
    if (type == 1) {
      this.shuttle.departing = event.data;
    } else {
      this.shuttle.destination = event.data;
    }
    let self = this;

    if (this.shuttle.departing.place_id && this.shuttle.destination.place_id) {
      let homeToDepartingRate;
      let airport = {
        place_id: "ChIJc3hQUMT5oI8RpDE_DiJie7I",
        geometry: {
          location: {
            lat: 9.9980535,
            lng: -84.20408959999997
          }
        }
      };
      let rate = 0;
      // calculate 

      this.directionService.route({
        origin: this.shuttle.departing.geometry.location,
        destination: this.shuttle.destination.geometry.location,
        travelMode: "DRIVING",
        provideRouteAlternatives: true
      }, function (response, status) {
        //calculos
        let distance;
        let kPrice: PriceObject;
        distance = response.routes[0].legs[0].distance.value / 1000;
        console.log(response);
        kPrice = self.getKilometerRate(distance);
        rate += distance * kPrice.price;
        console.log("Km " + distance + "\n" + "Price: $ " + rate)
        rate = rate - rate * kPrice.discount;


        self.shuttle.rate = rate;
        if (self.shuttle.departing.place_id != airport.place_id) {
          self.directionService.route({
            origin: airport.geometry.location,
            destination: self.shuttle.departing.geometry.location,
            travelMode: "DRIVING",
            provideRouteAlternatives: true
          }, function (response, status) {
            console.log(response);
            let distance = response.routes[0].legs[0].distance.value / 1000;
            let kPrice = self.getKilometerRate(distance);
            homeToDepartingRate = distance * kPrice.price;
            console.log("Km " + distance + "\n" + "Price: $ " + homeToDepartingRate)
            // homeToDepartingRate=homeToDepartingRate-homeToDepartingRate*0.4;
            rate = homeToDepartingRate + rate;
            self.shuttle.rate = parseFloat(rate.toFixed(2));
          })
        } else {
          self.shuttle.rate = parseFloat(rate.toFixed(2));
        }


      });


    }
  }

  applyTheme(pop: any) {
    // create new object on each property change
    // so Angular can catch object reference change
    this.bsConfig = Object.assign({}, { containerClass: this.colorTheme });
    setTimeout(() => {
      pop.show();
    });
  }

  getKilometerRate(distance): PriceObject {
    if (distance <= 50) {
      return {
        price: 3.57,
        discount: 1
      };
    } else if (distance > 55 && distance <= 65) {
      return {
        price: 2.24,
        discount: 0.8
      };
    } else if (distance > 50 && distance <= 75) {
      return {
        price: 2.24,
        discount: 0.9
      };
    } else if (distance > 97.2 && distance <= 99) {
      return {
        price: 1.68,
        discount: 1
      };
    } else if (distance > 75 && distance <= 100) {
      return {
        price: 1.68,
        discount: 0.8
      };
    } else if (distance > 113 && distance <= 116 || distance > 124 && distance <= 126) {
      return {
        price: 1.42,
        discount: 0.3
      };
    } else if (distance > 100 && distance <= 150) {
      return {
        price: 1.42,
        discount: 0.6
      };
    } else if (distance > 161 && distance <= 180) {
      return {
        price: 1.03,
        discount: 0
      };
    } else if (distance > 233 && distance <= 252) {
      return {
        price: 1.03,
        discount: 0.15
      };
    } else if (distance > 150 && distance <= 261) {
      return {
        price: 1.03,
        discount: 0.3
      };
    } else {
      return {
        price: 0.9,
        discount: 0
      };
    }
  }

  goToReservation() {
    this.reservationService.clearArray();
    this.reservationService.addShuttle(this);
    this.router.navigate(["/reservation"]);
  }

  compareFn(i1, i2) {
    return i1 && i2 ? i1.id === i2.id : i1 === i2;
  }

}
