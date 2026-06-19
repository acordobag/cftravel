import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CarouselConfig } from 'ngx-bootstrap';
import { Place, Testimonial, backEndUrl } from '../entities/entities';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [
    { provide: CarouselConfig, useValue: { interval: 4500, noPause: true, showIndicators: true } }
  ]
})
export class HomeComponent implements OnInit {

  public active: number;
  public destinations: Place[];
  public images;
  public testimonials: Testimonial[];
  public services;
  public trustItems;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.active = 0;
    this.destinations = [
      {
        id: 0,
        name: "Arenal Volcano",
        description: "Door-to-door private transfers to La Fortuna, hot springs, boutique hotels, and adventure lodges near Arenal Volcano.",
        images: [{ id: 0, src: "../assets/images/arenal.jpg" }]
      },
      {
        id: 1,
        name: "Jaco Beach",
        description: "Easy coastal rides for surf trips, family vacations, marina connections, and hotel-to-hotel transfers.",
        images: [{ id: 0, src: "../assets/images/jaco.jpg" }]
      },
      {
        id: 2,
        name: "SJO Airport",
        description: "Reliable private pickups and drop-offs with flight-friendly scheduling and transparent route pricing.",
        images: [{ id: 0, src: "../assets/images/airport.jpg" }]
      }
    ];

    this.images = [
      { state: true, id: 0, src: "assets/images/banner_0.jpg" },
      { state: false, id: 1, src: "assets/images/banner_1.png" }
    ];

    this.services = [
      {
        title: "Airport pickups",
        description: "Private arrivals and departures from SJO and Liberia with route planning around your flight schedule.",
        icon: "fa-plane"
      },
      {
        title: "Hotel to hotel",
        description: "Point-to-point transfers between beaches, volcano towns, national parks, and boutique stays.",
        icon: "fa-map-marker"
      },
      {
        title: "Multi-stop days",
        description: "Add grocery stops, viewpoints, lunch breaks, or custom stops to make long transfers easier.",
        icon: "fa-road"
      }
    ];

    this.trustItems = [
      { value: "Route-based", label: "Pricing logic" },
      { value: "Private", label: "Vehicle assignment" },
      { value: "Flexible", label: "Stops and schedules" },
      { value: "Local", label: "Costa Rica routing" }
    ];

    this.testimonials = this.getDefaultTestimonials();
    this.loadTestimonials();
  }

  loadTestimonials() {
    this.http.get<Testimonial[]>(backEndUrl + '/testimonial')
      .subscribe(testimonials => {
        if (testimonials && testimonials.length) {
          this.testimonials = testimonials;
        }
      }, () => {
        this.testimonials = this.getDefaultTestimonials();
      });
  }

  getStars(rating: number) {
    const stars = [];
    const total = rating || 5;

    for (let i = 0; i < total; i++) {
      stars.push(i);
    }

    return stars;
  }

  private getDefaultTestimonials(): Testimonial[] {
    return [
      {
        id: 1,
        name: "Mariana G.",
        location: "San Jose, Costa Rica",
        route: "SJO Airport to La Fortuna",
        rating: 5,
        comment: "The pickup was on time, the van was spotless, and the driver helped us plan a comfortable stop on the way to Arenal.",
        active: true
      },
      {
        id: 2,
        name: "David R.",
        location: "Austin, USA",
        route: "Jaco to Manuel Antonio",
        rating: 5,
        comment: "Clear pricing before booking and a very relaxed ride. It felt private, safe, and easy after a long travel day.",
        active: true
      },
      {
        id: 3,
        name: "Sofia L.",
        location: "Madrid, Spain",
        route: "Liberia Airport to Tamarindo",
        rating: 5,
        comment: "Our driver tracked the arrival time and was waiting when we landed. The whole transfer was smooth from airport to hotel.",
        active: true
      }
    ];
  }
}
