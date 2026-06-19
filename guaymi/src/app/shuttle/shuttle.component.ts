import { Component, OnInit, Input } from '@angular/core';
import 'rxjs/add/operator/map'
import { BsDatepickerDirective } from 'ngx-bootstrap/datepicker';
import { BsDatepickerConfig } from 'ngx-bootstrap';
import { Router } from '@angular/router';
import { ReservationService } from '../services/reservation.service';
import { PricingService, TransferPriceBreakdown } from '../services/pricing.service';
import { Shuttle, GmapPlace } from '../entities/entities';
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
  ismeridian: boolean = false;
  isCalculatingRate: boolean = false;
  rateError: string = "";
  priceBreakdown: TransferPriceBreakdown;

  private airport = {
    place_id: "ChIJc3hQUMT5oI8RpDE_DiJie7I",
    geometry: {
      location: {
        lat: 9.9980535,
        lng: -84.20408959999997
      }
    }
  };

  private sjo = {
    place_id: "ChIJxRUNxULjoI8RgrgRn2pqdOY",
    geometry: {
      location: {
        lat: 9.9280694,
        lng: -84.09072459999999
      }
    }
  };

  constructor(
    private router: Router,
    private reservationService: ReservationService,
    private pricingService: PricingService
  ) { }

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

    this.shuttle.rate = 0;
    this.shuttle.distance = 0;
    this.priceBreakdown = null;
    this.rateError = "";

    if (type == 1) {
      this.shuttle.departing = event.data;
    } else {
      this.shuttle.destination = event.data;
    }
    if (this.shuttle.departing.place_id && this.shuttle.destination.place_id) {
      this.calculateRate();
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

  calculateRate() {
    const self = this;
    this.isCalculatingRate = true;

    this.getRouteDistance(this.shuttle.departing.geometry.location, this.shuttle.destination.geometry.location)
      .then(function (routeDistance) {
        if (routeDistance === 0) {
          self.shuttle.rate = 0;
          self.shuttle.distance = 0;
          self.isCalculatingRate = false;
          return;
        }

        if (self.isAirportPickup()) {
          self.applyRate(routeDistance, 0);
          return;
        }

        Promise.all([
          self.getRouteDistance(self.airport.geometry.location, self.shuttle.departing.geometry.location),
          self.getRouteDistance(self.airport.geometry.location, self.shuttle.destination.geometry.location)
        ]).then(function (distances) {
          const repositionDistance = Math.max(distances[0], distances[1]);
          self.applyRate(routeDistance, repositionDistance);
        }).catch(function () {
          self.showRateError();
        });
      }).catch(function () {
        self.showRateError();
      });
  }

  private applyRate(routeDistance: number, repositionDistance: number) {
    this.priceBreakdown = this.pricingService.calculatePrivateTransferRate(routeDistance, repositionDistance);
    this.shuttle.distance = this.priceBreakdown.routeDistance;
    this.shuttle.rate = this.priceBreakdown.total;
    this.isCalculatingRate = false;
  }

  private getRouteDistance(origin, destination): Promise<number> {
    const self = this;

    return new Promise<number>(function (resolve, reject) {
      self.directionService.route({
        origin: origin,
        destination: destination,
        travelMode: "DRIVING",
        provideRouteAlternatives: true
      }, function (response, status) {
        if (status !== "OK" || !response.routes || !response.routes[0] || !response.routes[0].legs[0]) {
          reject(status);
          return;
        }

        resolve(response.routes[0].legs[0].distance.value / 1000);
      });
    });
  }

  private isAirportPickup(): boolean {
    return this.shuttle.departing.place_id === this.airport.place_id || this.shuttle.departing.place_id === this.sjo.place_id;
  }

  private showRateError() {
    this.isCalculatingRate = false;
    this.rateError = "We could not calculate this route yet. Please check both locations.";
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
