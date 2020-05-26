import { Component, OnInit, Input } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map'
import { BsDatepickerDirective } from 'ngx-bootstrap/datepicker';
import { BsDatepickerConfig } from 'ngx-bootstrap';
import { Router } from '@angular/router';
import { ReservationService } from '../services/reservation.service';
import { Shuttle, GmapPlace, backEndUrl, PriceObject } from '../entities/entities';
declare var google: any;


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
  discount;

  constructor(private router: Router, private reservationService: ReservationService, private http: Http) { }

  ngOnInit() {
    this.userSettings = {
      "geoCountryRestriction": ["cr"],
      "showRecentSearch": true,
      "showSearchButton": false,
      "inputPlaceholderText": "",
      "showCurrentLocation": false
    }
    this.minDate = new Date();
    this.shuttle = new Shuttle();
    this.directionService = new google.maps.DirectionsService();
  }

  autoCompleteCallback(event, type) {
    if (!event.data) {
      return;
    }
    let kPrice: PriceObject;
    this.shuttle.rate = 0;
    let distanceOne = 0;
    let distanceTwo = 0;

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
      let sjo = {
        place_id: "ChIJxRUNxULjoI8RgrgRn2pqdOY",
        geometry: {
          location: {
            lat: 9.9280694,
            lng: -84.09072459999999
          }
        }
      }
      let rate = 0;
      // calculate 

      this.directionService.route({
        origin: this.shuttle.departing.geometry.location,
        destination: this.shuttle.destination.geometry.location,
        travelMode: "DRIVING",
        provideRouteAlternatives: true
      }, function (response, status) {
        //calculos
        let normalDistance;

        normalDistance = response.routes[0].legs[0].distance.value / 1000;

        kPrice = self.getKilometerRate(normalDistance);

        rate += normalDistance * kPrice.price;
        //console.log(self.shuttle.departing.name + " a " + self.shuttle.destination.name + "\nKm " + normalDistance + "\n" + "Price: $ " + rate)

        if (normalDistance == 0) {
          return;
        }

        if (self.shuttle.departing.place_id != airport.place_id && self.shuttle.departing.place_id != sjo.place_id) {
          self.directionService.route({
            origin: airport.geometry.location,
            destination: self.shuttle.departing.geometry.location,
            travelMode: "DRIVING",
            provideRouteAlternatives: true
          }, function (response, status) {
            //Primera distancia
            distanceOne = response.routes[0].legs[0].distance.value / 1000;

            self.directionService.route({
              origin: airport.geometry.location,
              destination: self.shuttle.destination.geometry.location,
              travelMode: "DRIVING",
              provideRouteAlternatives: true
            }, function (response, status) {
              let distance;
              //Segunda distancia
              distanceTwo = response.routes[0].legs[0].distance.value / 1000;
              //temp var
              let temp;
              //Se usa la distancia mayor
              if (distanceOne < distanceTwo) {
                distance = distanceTwo;
                temp = self.shuttle.destination.name;
              } else {
                distance = distanceOne;
                temp = self.shuttle.departing.name;
              }

              let rateWoDiscount = rate;
              rate = rate - rate * kPrice.discount;
              kPrice = self.getKilometerRate(distance);
              homeToDepartingRate = distance * kPrice.price;
              console.log(self.shuttle.departing.name + " a " + self.shuttle.destination.name + "\nKm " + normalDistance + "\n" + "Price without discount: $ " + rateWoDiscount + "\nPrice with disccount: $ " + rate)
              console.log("Aeropuerto a " + temp + "\nKm " + distance + "\n" + "Price: $ " + homeToDepartingRate)
              rate = homeToDepartingRate + rate;
              self.shuttle.rate = parseFloat(rate.toFixed(2));
            });

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

  getKilometerRate(distance, ): PriceObject {
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
        discount: 0.9
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
    } else if (distance > 105 && distance <= 107) {
      return {
        price: 1.42,
        discount: 1.35
      };
    } else if (distance > 100 && distance <= 150) {
      return {
        price: 1.42,
        discount: 0.55
      };
    } else if (distance > 161 && distance <= 180) {
      return {
        price: 1.03,
        discount: 0
      };
    }
    else if (distance > 180 && distance <= 185) {
      return {
        price: 1.03,
        discount: 0.42
      };
    } else if (distance > 191 && distance <= 193.1) {
      return {
        price: 1.43,
        discount: 1
      };
    } else if (distance > 205 && distance <= 215) {
      return {
        price: 1.03,
        discount: 0.24
      };
    } else if (distance > 229 && distance <= 231) {
      return {
        price: 1.12,
        discount: 0.42
      };
    } else if (distance > 230 && distance <= 259) {
      return {
        price: 1.12,
        discount: 0.67
      };
    } else if (distance > 220 && distance <= 230) {
      return {
        price: 1.03,
        discount: 0.4
      };
    } else if (distance > 150 && distance <= 262) {
      return {
        price: 1.03,
        discount: 0.75
      };
    } else if (distance > 262 && distance <= 264) {
      return {
        price: 1.07,
        discount: 0.67
      };
    } else if (distance > 300 && distance <= 310) {
      return {
        price: 1.07,
        discount: 0.16
      };
    } else if (distance > 264 && distance <= 315) {
      return {
        price: 1.07,
        discount: 0.3
      };
    } else if (distance > 315 && distance <= 320) {
      return {
        price: 1.07,
        discount: 0.22
      };
    } else if (distance > 320 && distance <= 370) {
      return {
        price: 0.9,
        discount: 0.07
      };
    } else {
      return {
        price: 0.9,
        discount: 0
      };
    }
  }

  getKilometerRateBase(distance) {
    if (distance <= 40) {
      return {
        price: 3.57,
        discount: 1
      };
    } else if (distance > 40 && distance <= 55) {
      return {
        price: 2.55,
        discount: 0.8
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
    } else if (distance > 75 && distance <= 100) {
      return {
        price: 1.68,
        discount: 0.8
      };
    } else if (distance > 127.5 && distance <= 130) {
      return {
        price: 1.36,
        discount: 0.6
      };
    } else if (distance > 100 && distance <= 150) {
      return {
        price: 1.54,
        discount: 0.6
      };
    } else if (distance > 150 && distance <= 170) {
      return {
        price: 1.25,
        discount: 0.3
      };
    } else if (distance > 170 && distance <= 200) {
      return {
        price: 1.40,
        discount: 0.3
      };
    } else if (distance > 224 && distance <= 228) {
      return {
        price: 1.30,
        discount: 0.3
      };
    } else if (distance > 200 && distance <= 250) {
      return {
        price: 1.17,
        discount: 0.3
      };
    } else if (distance > 270 && distance <= 280) {
      return {
        price: 1.64,
        discount: 0.3
      };
    } else if (distance > 250 && distance <= 300) {
      return {
        price: 1.13,
        discount: 0.3
      };
    } else if (distance > 300 && distance <= 400) {
      return {
        price: 1.30,
        discount: 0.3
      };
    } else {
      return {
        price: 0.9,
        discount: 0
      };
    }
  }


  calcRate() {

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
