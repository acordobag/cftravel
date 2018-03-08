import { Component, OnInit, ViewChild, ViewContainerRef, ComponentFactoryResolver, ComponentFactory, ComponentRef } from '@angular/core';
import { ShuttleComponent } from '../shuttle/shuttle.component';
import { ReservationService } from '../services/reservation.service';
import { Shuttle, Reservation, backEndUrl } from '../entities/entities'
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.css']
})
export class ReservationComponent implements OnInit {

  @ViewChild("container", { read: ViewContainerRef }) container;
  @ViewChild('firstShuttle') firstShuttle;
  private shuttles: ShuttleComponent[];
  private reservation: Reservation;
  private renderShuttle: boolean;
  constructor(private resolver: ComponentFactoryResolver, private reservationService: ReservationService, private http: HttpClient, private router: Router) { }

  ngOnInit() {
    this.renderShuttle=true;
    this.reservation = new Reservation();
    this.shuttles = new Array<ShuttleComponent>();
    if(!this.reservationService.getShuttle(0)){
      this.router.navigate(["/home"]);
      this.renderShuttle=false;
    }
    this.shuttles.push(this.reservationService.getShuttle(0));
  }

  ngAfterViewInit() {
    if (!this.shuttles[0]) { return }
    setTimeout(() => {
      this.firstShuttle.shuttle = this.shuttles[0].shuttle;
    }, 1);
  }

  addShuttle(type) {
    const factory: ComponentFactory<ShuttleComponent> = this.resolver.resolveComponentFactory(ShuttleComponent);
    let componentRef: ComponentRef<ShuttleComponent> = this.container.createComponent(factory);
    componentRef.instance.type = 1;
    this.shuttles.push(componentRef.instance);
    componentRef.instance.number = this.shuttles.length;
  }

  processReservation() {
    this.shuttles.forEach(shuttle => {
      this.reservation.shuttles.push(shuttle.shuttle);
    });
    this.http.post(backEndUrl + '/reservation', this.reservation)
      .subscribe(res => {
        console.log(res);
      })
  }
}
