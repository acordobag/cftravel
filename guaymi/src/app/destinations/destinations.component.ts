import { Component, OnInit } from '@angular/core';
import { Place, backEndUrl } from '../entities/entities';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-destinations',
  templateUrl: './destinations.component.html',
  styleUrls: ['./destinations.component.css']
})
export class DestinationsComponent implements OnInit {

  public destinations: Place[];

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.http.get<Place[]>(backEndUrl + '/place')
    .subscribe(places => this.destinations = places);
  }

}
