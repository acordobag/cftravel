import { Injectable } from '@angular/core';
import { ShuttleComponent } from '../shuttle/shuttle.component';
import { Message } from '../entities/entities';
@Injectable()
export class ReservationService {

  private shuttles: ShuttleComponent[];
  private message: Message;

  constructor() {
    this.shuttles = new Array<ShuttleComponent>();
  }

  clearArray() {
    this.shuttles = new Array<ShuttleComponent>();
  }

  addShuttle(shuttle: ShuttleComponent) {
    this.shuttles.push(shuttle);
  }

  getShuttle(shuttleIndex: number) {
    return this.shuttles[shuttleIndex];
  }
}
