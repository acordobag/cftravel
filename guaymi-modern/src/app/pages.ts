import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { TravelStateService } from './travel-state.service';
import { ShuttleQuote } from './models';
declare const google: any;

@Component({
  selector: 'app-page-hero',
  standalone: true,
  template: `
    <section class="page-hero">
      <div>
        <p class="eyebrow">{{ eyebrow }}</p>
        <h1>{{ title }}</h1>
        <p>{{ text }}</p>
      </div>
    </section>
  `
})
export class PageHeroComponent {
  @Input() title = '';
  @Input() eyebrow = '';
  @Input() text = '';
}

@Component({
  selector: 'app-booking-card',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="booking-card" [class.booking-card-compact]="compact">
      <div class="booking-heading">
        <div>
          <p class="eyebrow" *ngIf="!compact">Private shuttle booking</p>
          <h2>{{ compact ? 'Transfer ' + number : 'Plan your Costa Rica transfer' }}</h2>
        </div>
        <div class="fare-pill" *ngIf="activeQuote.total > 0">
          <span>Estimated fare</span>
          <strong>\${{ activeQuote.total | number:'1.2-2' }}</strong>
        </div>
      </div>

      <form class="booking-form">
        <label class="field field-wide">
          <span>Departing from</span>
          <input
            #departingInput
            type="text"
            name="departing"
            list="departing-options"
            [(ngModel)]="activeQuote.departingSearch"
            (change)="state.selectKnownPlace(activeQuote, 'departing', activeQuote.departingSearch)"
            autocomplete="off"
            required>
          <datalist id="departing-options">
            <option *ngFor="let place of state.places" [value]="place.name"></option>
          </datalist>
        </label>
        <label class="field field-wide">
          <span>Going to</span>
          <input
            #destinationInput
            type="text"
            name="destination"
            list="destination-options"
            [(ngModel)]="activeQuote.destinationSearch"
            (change)="state.selectKnownPlace(activeQuote, 'destination', activeQuote.destinationSearch)"
            autocomplete="off"
            required>
          <datalist id="destination-options">
            <option *ngFor="let place of state.places" [value]="place.name"></option>
          </datalist>
        </label>
        <label class="field">
          <span>Passengers</span>
          <input type="number" name="passengers" min="1" max="20" [(ngModel)]="activeQuote.passengers" required>
        </label>
        <label class="field">
          <span>Pickup date</span>
          <input type="date" name="date" [min]="state.today" [(ngModel)]="activeQuote.date" required>
        </label>
        <label class="field">
          <span>Pickup time</span>
          <input type="time" name="time" [(ngModel)]="activeQuote.time" required>
        </label>
      </form>

      <div class="rate-status" *ngIf="activeQuote.isCalculating">Calculating the best route...</div>
      <div class="rate-error" *ngIf="activeQuote.rateError">{{ activeQuote.rateError }}</div>

      <div class="rate-breakdown" *ngIf="activeQuote.total > 0">
        <div><span>Route</span><strong>{{ activeQuote.routeDistance }} km</strong></div>
        <div><span>Operations distance</span><strong>{{ activeQuote.repositionDistance }} km</strong></div>
        <div><span>Total</span><strong>\${{ activeQuote.total | number:'1.2-2' }}</strong></div>
      </div>

      <div class="booking-actions" *ngIf="!compact">
        <button type="button" class="primary-action" [disabled]="activeQuote.total <= 0" (click)="continueBooking()">Continue booking</button>
      </div>
    </section>
  `
})
export class BookingCardComponent {
  @Input() quote?: ShuttleQuote;
  @Input() compact = false;
  @Input() number = 1;
  @ViewChild('departingInput') departingInput?: ElementRef<HTMLInputElement>;
  @ViewChild('destinationInput') destinationInput?: ElementRef<HTMLInputElement>;

  constructor(public readonly state: TravelStateService, private readonly router: Router) {}

  get activeQuote(): ShuttleQuote {
    return this.quote || this.state.quote;
  }

  ngAfterViewInit(): void {
    this.attachAutocomplete(this.departingInput, 'departing');
    this.attachAutocomplete(this.destinationInput, 'destination');
  }

  continueBooking(): void {
    if (!this.activeQuote.total) {
      return;
    }

    this.state.startReservationFromQuote();
    this.router.navigate(['/reservation']);
  }

  private attachAutocomplete(input: ElementRef<HTMLInputElement> | undefined, kind: 'departing' | 'destination', attempts = 0): void {
    const maps = (globalThis as any).google?.maps;
    if (!input || !maps?.places?.Autocomplete) {
      if (attempts < 12) {
        window.setTimeout(() => this.attachAutocomplete(input, kind, attempts + 1), 500);
      }
      return;
    }

    const autocomplete = new google.maps.places.Autocomplete(input.nativeElement, {
      componentRestrictions: { country: 'cr' },
      fields: ['formatted_address', 'geometry', 'name', 'place_id']
    });

    autocomplete.addListener('place_changed', () => {
      this.state.setGooglePlace(this.activeQuote, kind, autocomplete.getPlace());
    });
  }
}

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, BookingCardComponent],
  template: `
    <section class="hero" [style.background-image]="'linear-gradient(90deg, rgba(10, 20, 34, 0.76), rgba(10, 20, 34, 0.24)), url(' + state.heroImages[state.activeHero()] + ')'">
      <div class="hero-content">
        <p class="eyebrow">Costa Rica private transportation</p>
        <h1>CR Travel Service</h1>
        <p>Book a private shuttle with route-aware pricing, direct pickups, and flexible stops for real travel days.</p>
        <div class="hero-stats">
          <div><strong>24/7</strong><span>Airport routes</span></div>
          <div><strong>Private</strong><span>No shared stops</span></div>
          <div><strong>Local</strong><span>Costa Rica routing</span></div>
        </div>
      </div>
    </section>
    <app-booking-card></app-booking-card>
    <section class="quick-grid page-band">
      <a routerLink="/services" class="quick-card"><span>Services</span><strong>Airport, hotel-to-hotel, multi-stop routes</strong></a>
      <a routerLink="/destinations" class="quick-card"><span>Destinations</span><strong>Explore popular Costa Rica transfers</strong></a>
      <a routerLink="/testimonials" class="quick-card"><span>Testimonials</span><strong>Traveler notes from the road</strong></a>
    </section>
    <section class="services-section">
      <div class="section-heading">
        <p class="eyebrow">Services</p>
        <h2>Built around private travel days</h2>
      </div>
      <div class="service-grid">
        <article class="service-card" *ngFor="let service of state.services">
          <div class="service-icon" [ngSwitch]="service.icon">
            <svg *ngSwitchCase="'AIR'" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M2.5 16.5 21 3.5l-5 17-4.4-7.1-6.8 3.3-2.3-.2Zm4.8-2.8 5.1-2.5 2.3 3.7 2.5-8.6-9.9 7.4Z"/>
            </svg>
            <svg *ngSwitchCase="'H2H'" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 20V9.7L12 4l8 5.7V20h-5.7v-6.1H9.7V20H4Zm2-2h1.7v-6.1h8.6V18H18v-7.2l-6-4.3-6 4.3V18Z"/>
            </svg>
            <svg *ngSwitchCase="'ADD'" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M11 13H5v-2h6V5h2v6h6v2h-6v6h-2v-6Z"/>
              <path d="M4 4h5v2H6v3H4V4Zm11 0h5v5h-2V6h-3V4ZM4 15h2v3h3v2H4v-5Zm14 0h2v5h-5v-2h3v-3Z"/>
            </svg>
          </div>
          <h3>{{ service.title }}</h3>
          <p>{{ service.text }}</p>
        </article>
      </div>
    </section>
    <section class="trust-band">
      <div class="trust-copy">
        <p class="eyebrow">Why choose CR Travel Service</p>
        <h2>Clear transfer planning before the road begins</h2>
        <p>Compare your route, see the estimated fare, and send one clean booking request for single or multi-transfer itineraries.</p>
      </div>
      <div class="trust-grid">
        <div *ngFor="let item of state.trustItems"><strong>{{ item.value }}</strong><span>{{ item.label }}</span></div>
      </div>
    </section>
    <section class="destinations-section">
      <div class="section-heading">
        <p class="eyebrow">Popular routes</p>
        <h2>Costa Rica destinations</h2>
      </div>
      <div class="destination-grid">
        <article class="destination-card" *ngFor="let place of state.places.slice(0, 3)">
          <img [src]="place.image" [alt]="place.name">
          <div><span>{{ place.zone }}</span><h3>{{ place.name }}</h3><p>{{ place.description }}</p></div>
        </article>
      </div>
    </section>
    <section class="experience-section">
      <div class="experience-media"><img src="assets/images/bus.png" alt="Private shuttle van"></div>
      <div class="experience-copy">
        <p class="eyebrow">Ride experience</p>
        <h2>Private vans, planned stops, smoother handoffs</h2>
        <p>Long routes in Costa Rica can include mountain roads, ferry timing, beach traffic, and airport deadlines. The booking flow keeps the operational distance visible so pricing is easier to understand.</p>
        <div class="experience-list"><span>Air-conditioned vehicles</span><span>Hotel and villa pickups</span><span>Custom stops by request</span></div>
      </div>
    </section>
    <section class="testimonials-section">
      <div class="section-heading centered">
        <p class="eyebrow">Testimonials</p>
        <h2>Traveler notes from the road</h2>
      </div>
      <article class="testimonial-card" *ngIf="state.currentTestimonial() as testimonial">
        <div class="stars" aria-label="Five star rating">&starf;&starf;&starf;&starf;&starf;</div>
        <p class="quote">"{{ testimonial.comment }}"</p>
        <div class="testimonial-footer">
          <div><strong>{{ testimonial.name }}</strong><span>{{ testimonial.location }}</span></div>
          <small>{{ testimonial.route }}</small>
        </div>
        <div class="carousel-actions">
          <button type="button" aria-label="Previous testimonial" (click)="state.previousTestimonial()">&lsaquo;</button>
          <button type="button" aria-label="Next testimonial" (click)="state.nextTestimonial()">&rsaquo;</button>
        </div>
      </article>
    </section>
    <section class="final-cta">
      <div>
        <p class="eyebrow">Ready when your route is</p>
        <h2>Build your private transfer request in minutes</h2>
      </div>
      <a class="cta-button" routerLink="/reservation">Start with your route</a>
    </section>
  `
})
export class HomePageComponent {
  constructor(public readonly state: TravelStateService) {}
}

@Component({
  standalone: true,
  imports: [CommonModule, PageHeroComponent],
  template: `
    <app-page-hero title="Services" eyebrow="Private shuttle options" text="Focused transport products for common Costa Rica travel days."></app-page-hero>
    <section class="services-section page-content">
      <div class="service-grid">
        <article class="service-card" *ngFor="let service of state.services">
          <div class="service-icon" [ngSwitch]="service.icon">
            <svg *ngSwitchCase="'AIR'" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M2.5 16.5 21 3.5l-5 17-4.4-7.1-6.8 3.3-2.3-.2Zm4.8-2.8 5.1-2.5 2.3 3.7 2.5-8.6-9.9 7.4Z"/>
            </svg>
            <svg *ngSwitchCase="'H2H'" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 20V9.7L12 4l8 5.7V20h-5.7v-6.1H9.7V20H4Zm2-2h1.7v-6.1h8.6V18H18v-7.2l-6-4.3-6 4.3V18Z"/>
            </svg>
            <svg *ngSwitchCase="'ADD'" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M11 13H5v-2h6V5h2v6h6v2h-6v6h-2v-6Z"/>
              <path d="M4 4h5v2H6v3H4V4Zm11 0h5v5h-2V6h-3V4ZM4 15h2v3h3v2H4v-5Zm14 0h2v5h-5v-2h3v-3Z"/>
            </svg>
          </div>
          <h3>{{ service.title }}</h3>
          <p>{{ service.text }}</p>
        </article>
      </div>
    </section>
    <section class="trust-band">
      <div class="trust-copy">
        <p class="eyebrow">Why choose CR Travel Service</p>
        <h2>Clear transfer planning before the road begins</h2>
        <p>Compare your route, see the estimated fare, and send one clean request for single or multi-stop itineraries.</p>
      </div>
      <div class="trust-grid">
        <div *ngFor="let item of state.trustItems"><strong>{{ item.value }}</strong><span>{{ item.label }}</span></div>
      </div>
    </section>
  `
})
export class ServicesPageComponent {
  constructor(public readonly state: TravelStateService) {}
}

@Component({
  standalone: true,
  imports: [CommonModule, PageHeroComponent],
  template: `
    <app-page-hero title="Destinations" eyebrow="Popular routes" text="Private transfers to airports, beaches, volcano towns, and cloud forest stays."></app-page-hero>
    <section class="destinations-section page-content">
      <div class="destination-grid">
        <article class="destination-card" *ngFor="let place of state.places">
          <img [src]="place.image" [alt]="place.name">
          <div><span>{{ place.zone }}</span><h3>{{ place.name }}</h3><p>{{ place.description }}</p></div>
        </article>
      </div>
    </section>
  `
})
export class DestinationsPageComponent {
  constructor(public readonly state: TravelStateService) {}
}

@Component({
  standalone: true,
  imports: [CommonModule, PageHeroComponent],
  template: `
    <app-page-hero title="Testimonials" eyebrow="Traveler notes" text="Real feedback shown as route-aware cards from the local API when available."></app-page-hero>
    <section class="testimonials-section page-content">
      <article class="testimonial-card" *ngIf="state.currentTestimonial() as testimonial">
        <div class="stars" aria-label="Five star rating">&starf;&starf;&starf;&starf;&starf;</div>
        <p class="quote">"{{ testimonial.comment }}"</p>
        <div class="testimonial-footer">
          <div><strong>{{ testimonial.name }}</strong><span>{{ testimonial.location }}</span></div>
          <small>{{ testimonial.route }}</small>
        </div>
        <div class="carousel-actions">
          <button type="button" aria-label="Previous testimonial" (click)="state.previousTestimonial()">&lsaquo;</button>
          <button type="button" aria-label="Next testimonial" (click)="state.nextTestimonial()">&rsaquo;</button>
        </div>
      </article>
    </section>
  `
})
export class TestimonialsPageComponent {
  constructor(public readonly state: TravelStateService) {}
}

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <form class="reservation-form" #reservationForm="ngForm" (ngSubmit)="state.submitReservation()">
      <input name="name" placeholder="First name" [(ngModel)]="state.customer.name" required>
      <input name="lastName" placeholder="Last name" [(ngModel)]="state.customer.lastName" required>
      <input name="phone" placeholder="Phone" [(ngModel)]="state.customer.phone" required>
      <input name="email" type="email" placeholder="Email" [(ngModel)]="state.customer.email" required>
      <textarea name="notes" placeholder="Trip notes" rows="4" [(ngModel)]="state.customer.notes"></textarea>
      <div class="submit-row">
        <button type="submit" class="primary-action" [disabled]="reservationForm.invalid || !state.canSubmitReservation()">Send booking request</button>
      </div>
      <p class="success" *ngIf="state.reservationSent()">Request sent. We will follow up shortly.</p>
      <p class="error" *ngIf="state.reservationError()">{{ state.reservationError() }}</p>
    </form>
  `
})
export class ReservationFormComponent {
  constructor(public readonly state: TravelStateService) {}
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeroComponent, BookingCardComponent, ReservationFormComponent],
  template: `
    <section class="reservation-page">
      <div class="reservation-shell">
        <div class="reservation-heading">
          <p class="eyebrow">Booking request</p>
          <h1>Review your private transfer</h1>
        </div>

        <div class="passenger-alert" *ngIf="hasLargeParty()">
          Larger parties may require a custom vehicle assignment. We will confirm the best option before payment.
        </div>

        <div class="transfer-list">
          <div class="transfer-item" *ngFor="let transfer of state.reservationShuttles(); let index = index">
            <app-booking-card [quote]="transfer" [compact]="true" [number]="index + 1"></app-booking-card>
            <button
              type="button"
              class="remove-transfer"
              *ngIf="state.reservationShuttles().length > 1"
              (click)="state.removeReservationShuttle(transfer.uid)">
              Remove transfer
            </button>
          </div>
        </div>

        <div class="transfer-actions">
          <button type="button" class="secondary-action" (click)="state.addReservationShuttle()">Add another transfer</button>
        </div>

        <section class="details-panel">
          <div class="panel-heading">
            <p class="eyebrow">Traveler details</p>
            <h2>Contact information</h2>
          </div>
          <app-reservation-form></app-reservation-form>
        </section>
      </div>
    </section>
  `
})
export class ReservationPageComponent {
  constructor(public readonly state: TravelStateService) {
    if (!this.state.reservationShuttles().length) {
      this.state.startReservationFromQuote();
    }
  }

  hasLargeParty(): boolean {
    return this.state.reservationShuttles().some((transfer) => transfer.passengers > 5);
  }
}

@Component({
  standalone: true,
  imports: [PageHeroComponent],
  template: `
    <app-page-hero title="About" eyebrow="Local operations" text="CR Travel Service is built around private shuttle planning for Costa Rica routes."></app-page-hero>
    <section class="experience-section">
      <div class="experience-media"><img src="assets/images/bus.png" alt="Private shuttle van"></div>
      <div class="experience-copy">
        <p class="eyebrow">Ride experience</p>
        <h2>Private vans, planned stops, smoother handoffs</h2>
        <p>Long routes can include mountain roads, beach traffic, ferry timing, and airport deadlines. The quote keeps route and operations distance visible.</p>
        <div class="experience-list"><span>Air-conditioned vehicles</span><span>Hotel and villa pickups</span><span>Custom stops by request</span></div>
      </div>
    </section>
  `
})
export class AboutPageComponent {}

@Component({
  standalone: true,
  imports: [PageHeroComponent, ReservationFormComponent],
  template: `
    <app-page-hero title="Contact" eyebrow="Talk to us" text="Share your route, timing, and passenger details so we can confirm availability."></app-page-hero>
    <section class="reservation-section page-content-dark">
      <div class="reservation-copy">
        <p class="eyebrow">Contact</p>
        <h2>Tell us about your transfer</h2>
        <p>Use the form and we will confirm vehicle availability, pickup timing, and custom stops.</p>
      </div>
      <app-reservation-form></app-reservation-form>
    </section>
  `
})
export class ContactPageComponent {}
