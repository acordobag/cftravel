import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, NgZone, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { environment } from '../environments/environment';
const API = environment.apiUrl;

import { I18nService } from './i18n.service';
import { PhoneFieldComponent } from './phone-field.component';
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
          <p class="eyebrow" *ngIf="!compact">{{ i18n.tx().booking.eyebrow }}</p>
          <h2>{{ compact ? i18n.tx().booking.compactPrefix + ' ' + number : i18n.tx().booking.heading }}</h2>
        </div>
        <div class="fare-pill" *ngIf="activeQuote.total > 0 && !activeQuote.isCalculating">
          <span>{{ i18n.tx().booking.estimatedFare }}</span>
          <strong>\${{ activeQuote.total | number:'1.2-2' }}</strong>
        </div>
        <div class="fare-pill fare-pill-calculating" *ngIf="activeQuote.isCalculating">
          <span>{{ i18n.tx().booking.calculatingRoute }}</span>
          <span class="fare-spinner"></span>
        </div>
      </div>

      <form class="booking-form">
        <label class="field field-wide" [class.field-loading]="activeQuote.isCalculating && resolvingKind === 'departing'">
          <span>{{ i18n.tx().booking.departing }}</span>
          <input
            #departingInput
            type="text"
            name="departing"
            list="departing-options"
            [(ngModel)]="activeQuote.departingSearch"
            (change)="onPlaceChange('departing')"
            autocomplete="off"
            required>
          <span class="field-spinner" *ngIf="activeQuote.isCalculating && resolvingKind === 'departing'"></span>
          <datalist id="departing-options">
            <option *ngFor="let place of state.places" [value]="place.name"></option>
          </datalist>
        </label>
        <label class="field field-wide" [class.field-loading]="activeQuote.isCalculating && resolvingKind === 'destination'">
          <span>{{ i18n.tx().booking.destination }}</span>
          <input
            #destinationInput
            type="text"
            name="destination"
            list="destination-options"
            [(ngModel)]="activeQuote.destinationSearch"
            (change)="onPlaceChange('destination')"
            autocomplete="off"
            required>
          <span class="field-spinner" *ngIf="activeQuote.isCalculating && resolvingKind === 'destination'"></span>
          <datalist id="destination-options">
            <option *ngFor="let place of state.places" [value]="place.name"></option>
          </datalist>
        </label>
        <label class="field">
          <span>{{ i18n.tx().booking.passengers }}</span>
          <input type="number" name="passengers" min="1" [max]="maxPassengers" [(ngModel)]="activeQuote.passengers" (ngModelChange)="onPassengersChange()" required>
        </label>
        <label class="field">
          <span>{{ i18n.tx().booking.date }}</span>
          <input type="date" name="date" [min]="state.today" [(ngModel)]="activeQuote.date" required>
        </label>
        <label class="field">
          <span>{{ i18n.tx().booking.time }}</span>
          <input type="time" name="time" [(ngModel)]="activeQuote.time" required>
        </label>

        <label class="field field-wide" *ngIf="state.carTypes().length">
          <span>{{ i18n.tx().booking.vehicleType }}</span>
          <select name="carTypeId" [(ngModel)]="activeQuote.carTypeId" (ngModelChange)="selectCarType($event)">
            <option [ngValue]="null">— {{ i18n.tx().booking.anyVehicle }} —</option>
            <option *ngFor="let ct of state.carTypes()" [ngValue]="ct.id">
              {{ ct.name }} ({{ i18n.tx().booking.upTo }} {{ ct.capacity }} {{ i18n.tx().booking.pax }}<ng-container *ngIf="ct.extraPassengerCharge > 0">, +\${{ ct.extraPassengerCharge }}/{{ i18n.tx().booking.extraPax }}</ng-container>)
            </option>
          </select>
          <p class="vehicle-warn" *ngIf="passengerWarning">⚠ {{ passengerWarning }}</p>
        </label>

        <div class="field field-wide children-toggle-row">
          <button type="button" class="children-toggle-btn" (click)="activeQuote.showChildren = !activeQuote.showChildren">
            <span *ngIf="!activeQuote.showChildren">{{ i18n.tx().booking.addChildren }}</span>
            <span *ngIf="activeQuote.showChildren">{{ i18n.tx().booking.hideChildren }}</span>
            <span class="children-badge" *ngIf="totalChildren > 0">&nbsp;({{ totalChildren }})</span>
          </button>
        </div>

        <div class="children-section" *ngIf="activeQuote.showChildren">
          <div class="child-group">
            <span class="child-label">{{ i18n.tx().booking.infant }} <small>0–1</small></span>
            <div class="child-counter">
              <button type="button" class="counter-btn" (click)="changeChild('infantCount', -1)" [disabled]="activeQuote.infantCount <= 0">−</button>
              <span>{{ activeQuote.infantCount }}</span>
              <button type="button" class="counter-btn" (click)="changeChild('infantCount', 1)">+</button>
            </div>
          </div>
          <div class="child-group">
            <span class="child-label">{{ i18n.tx().booking.toddler }} <small>1–4</small></span>
            <div class="child-counter">
              <button type="button" class="counter-btn" (click)="changeChild('toddlerCount', -1)" [disabled]="activeQuote.toddlerCount <= 0">−</button>
              <span>{{ activeQuote.toddlerCount }}</span>
              <button type="button" class="counter-btn" (click)="changeChild('toddlerCount', 1)">+</button>
            </div>
          </div>
          <div class="child-group">
            <span class="child-label">{{ i18n.tx().booking.preschool }} <small>4–6</small></span>
            <div class="child-counter">
              <button type="button" class="counter-btn" (click)="changeChild('preschoolCount', -1)" [disabled]="activeQuote.preschoolCount <= 0">−</button>
              <span>{{ activeQuote.preschoolCount }}</span>
              <button type="button" class="counter-btn" (click)="changeChild('preschoolCount', 1)">+</button>
            </div>
          </div>
          <div class="child-group">
            <span class="child-label">{{ i18n.tx().booking.child }} <small>6–12</small></span>
            <div class="child-counter">
              <button type="button" class="counter-btn" (click)="changeChild('childCount', -1)" [disabled]="activeQuote.childCount <= 0">−</button>
              <span>{{ activeQuote.childCount }}</span>
              <button type="button" class="counter-btn" (click)="changeChild('childCount', 1)">+</button>
            </div>
          </div>
        </div>
      </form>

      <div class="rate-error" *ngIf="activeQuote.rateError">{{ activeQuote.rateError }}</div>

      <div class="rate-breakdown" *ngIf="activeQuote.total > 0 && !activeQuote.isCalculating">
        <div><span>{{ i18n.tx().booking.routeLabel }}</span><strong>{{ activeQuote.routeDistance }} km</strong></div>
        <div *ngIf="activeQuote.repositionDistance > 0"><span>{{ i18n.tx().booking.operationsLabel }}</span><strong>{{ activeQuote.repositionDistance }} km</strong></div>
        <div *ngIf="activeQuote.vehicleSurcharge > 0"><span>{{ i18n.tx().booking.extraPaxLabel }}</span><strong>\${{ activeQuote.vehicleSurcharge | number:'1.2-2' }}</strong></div>
        <div><span>{{ i18n.tx().booking.totalLabel }}</span><strong>\${{ activeQuote.total | number:'1.2-2' }}</strong></div>
      </div>
      <div class="rate-breakdown rate-breakdown-skeleton" *ngIf="activeQuote.isCalculating">
        <div><span>{{ i18n.tx().booking.routeLabel }}</span><strong class="skeleton-bar"></strong></div>
        <div><span>{{ i18n.tx().booking.operationsLabel }}</span><strong class="skeleton-bar"></strong></div>
        <div><span>{{ i18n.tx().booking.totalLabel }}</span><strong class="skeleton-bar"></strong></div>
      </div>

      <div class="booking-actions" *ngIf="!compact">
        <button type="button" class="primary-action" [disabled]="activeQuote.total <= 0 || activeQuote.isCalculating" (click)="continueBooking()">{{ i18n.tx().booking.continueBtn }}</button>
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

  resolvingKind: 'departing' | 'destination' | null = null;

  constructor(public readonly state: TravelStateService, private readonly router: Router, private readonly zone: NgZone, public readonly i18n: I18nService) {}

  get activeQuote(): ShuttleQuote {
    return this.quote || this.state.quote;
  }

  ngAfterViewInit(): void {
    this.attachAutocomplete(this.departingInput, 'departing');
    this.attachAutocomplete(this.destinationInput, 'destination');
  }

  onPlaceChange(kind: 'departing' | 'destination'): void {
    this.resolvingKind = kind;
    this.state.selectKnownPlace(this.activeQuote, kind,
      kind === 'departing' ? this.activeQuote.departingSearch : this.activeQuote.destinationSearch
    );
    this.resolvingKind = null;
  }

  selectCarType(id: number | null): void {
    this.activeQuote.carTypeId = id;
    this.state.recalculate(this.activeQuote);
  }

  onPassengersChange(): void {
    this.state.recalculate(this.activeQuote);
  }

  get selectedCarType() {
    return this.state.carTypes().find((ct) => ct.id === this.activeQuote.carTypeId) || null;
  }

  get maxPassengers(): number {
    const ct = this.selectedCarType;
    return ct ? ct.capacity + ct.maxExtraPassengers : 20;
  }

  get passengerWarning(): string {
    const ct = this.selectedCarType;
    if (!ct) return '';
    if (this.activeQuote.passengers > ct.capacity + ct.maxExtraPassengers) {
      return `Max ${ct.capacity + ct.maxExtraPassengers} passengers for this vehicle.`;
    }
    if (this.activeQuote.passengers > ct.capacity) {
      const extra = this.activeQuote.passengers - ct.capacity;
      return `${extra} extra passenger${extra > 1 ? 's' : ''} — surcharge applies.`;
    }
    return '';
  }

  get totalChildren(): number {
    return (this.activeQuote.infantCount || 0) + (this.activeQuote.toddlerCount || 0) + (this.activeQuote.preschoolCount || 0) + (this.activeQuote.childCount || 0);
  }

  changeChild(field: 'infantCount' | 'toddlerCount' | 'preschoolCount' | 'childCount', delta: number): void {
    const current = this.activeQuote[field] || 0;
    this.activeQuote[field] = Math.max(0, current + delta);
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
      this.zone.run(async () => {
        this.resolvingKind = kind;
        await this.state.setGooglePlace(this.activeQuote, kind, autocomplete.getPlace());
        this.resolvingKind = null;
      });
    });
  }
}

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, BookingCardComponent],
  template: `
    <section class="hero" [style.background-image]="'linear-gradient(90deg, rgba(10, 20, 34, 0.76), rgba(10, 20, 34, 0.24)), url(' + state.heroImages[state.activeHero()] + ')'">
      <div class="hero-content">
        <p class="eyebrow">{{ i18n.tx().hero.eyebrow }}</p>
        <h1>{{ i18n.tx().hero.h1 }}</h1>
        <p>{{ i18n.tx().hero.p }}</p>
        <div class="hero-actions">
          <a routerLink="/reservation" class="hero-button">{{ i18n.tx().hero.cta }}</a>
          <a routerLink="/destinations" class="hero-link">{{ i18n.tx().hero.ctaLink }}</a>
        </div>
        <div class="hero-stats">
          <div *ngFor="let item of i18n.tx().routeHighlights"><strong>{{ item.value }}</strong><span>{{ item.label }}</span></div>
        </div>
      </div>
    </section>
    <app-booking-card></app-booking-card>
    <section class="route-promises page-band">
      <div *ngFor="let p of i18n.tx().promises"><strong>{{ p.title }}</strong><span>{{ p.text }}</span></div>
    </section>
    <section class="assurance-strip page-band">
      <span *ngFor="let badge of i18n.tx().assurance">{{ badge }}</span>
    </section>
    <section class="quick-grid page-band">
      <a *ngFor="let card of i18n.tx().quickGrid" [routerLink]="card.path" class="quick-card"><span>{{ card.label }}</span><strong>{{ card.text }}</strong></a>
    </section>
    <section class="process-section">
      <div class="section-heading centered">
        <p class="eyebrow">{{ i18n.tx().howItWorks.eyebrow }}</p>
        <h2>{{ i18n.tx().howItWorks.heading }}</h2>
      </div>
      <div class="process-grid">
        <article class="process-card" *ngFor="let item of i18n.tx().bookingSteps">
          <span>{{ item.step }}</span>
          <h3>{{ item.title }}</h3>
          <p>{{ item.text }}</p>
        </article>
      </div>
    </section>
    <section class="services-section">
      <div class="section-heading">
        <p class="eyebrow">{{ i18n.tx().servicesSection.eyebrow }}</p>
        <h2>{{ i18n.tx().servicesSection.heading }}</h2>
      </div>
      <div class="service-grid">
        <article class="service-card" *ngFor="let service of i18n.tx().services">
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
    <section class="confidence-section">
      <div class="section-heading centered">
        <p class="eyebrow">{{ i18n.tx().confidenceSection.eyebrow }}</p>
        <h2>{{ i18n.tx().confidenceSection.heading }}</h2>
      </div>
      <div class="confidence-grid">
        <article class="confidence-card" *ngFor="let item of i18n.tx().confidenceItems">
          <div class="confidence-icon" [ngSwitch]="item.icon">
            <svg *ngSwitchCase="'SAFE'" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22c-4.7-1.4-8-5.8-8-10.7V5l8-3 8 3v6.3c0 4.9-3.3 9.3-8 10.7Zm0-2.1c3.5-1.2 6-4.6 6-8.6V6.4l-6-2.3-6 2.3v4.9c0 4 2.5 7.4 6 8.6Zm-1.1-5.1 5-5-1.4-1.4-3.6 3.6-1.4-1.4-1.4 1.4 2.8 2.8Z"/></svg>
            <svg *ngSwitchCase="'TIME'" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20Zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm1-8.4 3.3 3.3-1.4 1.4-3.9-3.9V6h2v5.6Z"/></svg>
            <svg *ngSwitchCase="'CHAT'" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20.5V5a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H8.4L4 20.5ZM7 4a1 1 0 0 0-1 1v10.1L7.6 13H17a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H7Zm1.5 3h7v2h-7V7Zm0 3h5v2h-5v-2Z"/></svg>
            <svg *ngSwitchCase="'VIP'" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 2.8 6.1 6.7.8-5 4.5 1.3 6.6L12 16.6 6.2 20l1.3-6.6-5-4.5 6.7-.8L12 2Zm0 4.9-1.5 3.2-3.5.4 2.6 2.3-.7 3.4 3.1-1.8 3.1 1.8-.7-3.4 2.6-2.3-3.5-.4L12 6.9Z"/></svg>
            <svg *ngSwitchCase="'PRICE'" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5a3 3 0 0 1 3-3h8.2L21 7.8V19a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V5Zm3-1a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V9h-5V4H7Zm9 .4V7h2.6L16 4.4ZM8 9h6v2H8V9Zm0 4h8v2H8v-2Zm0 4h5v2H8v-2Z"/></svg>
            <svg *ngSwitchCase="'FAMILY'" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm0-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm8.5 2.5a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm0-2a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM2 21v-3a5 5 0 0 1 10 0v3H2Zm2-2h6v-1a3 3 0 0 0-6 0v1Zm9 2v-2.5a4.5 4.5 0 0 0-1-2.8 4 4 0 0 1 8 2.3v3h-7Zm2.5-2H18v-1a2 2 0 0 0-3.2-1.6c.4.7.7 1.5.7 2.1v.5Z"/></svg>
          </div>
          <h3>{{ item.title }}</h3>
          <p>{{ item.text }}</p>
        </article>
      </div>
    </section>
    <section class="fleet-section">
      <div class="section-heading">
        <p class="eyebrow">{{ i18n.tx().fleetSection.eyebrow }}</p>
        <h2>{{ i18n.tx().fleetSection.heading }}</h2>
      </div>
      <div class="fleet-grid">
        <ng-container *ngIf="state.carTypes().length; else staticFleet">
          <article class="fleet-card" *ngFor="let ct of state.carTypes()">
            <img src="assets/images/bus.png" [alt]="ct.name">
            <div>
              <h3>{{ ct.name }}</h3>
              <p>{{ ct.description }}</p>
              <span class="fleet-capacity">{{ i18n.tx().booking.upTo }} {{ ct.capacity }} {{ i18n.tx().booking.pax }}<ng-container *ngIf="ct.maxExtraPassengers > 0"> (+{{ ct.maxExtraPassengers }})</ng-container></span>
            </div>
          </article>
        </ng-container>
        <ng-template #staticFleet>
          <article class="fleet-card" *ngFor="let item of i18n.tx().fleetHighlights">
            <img src="assets/images/bus.png" alt="Private shuttle vehicle">
            <div><h3>{{ item.title }}</h3><p>{{ item.text }}</p></div>
          </article>
        </ng-template>
      </div>
    </section>
    <section class="trust-band">
      <div class="trust-copy">
        <p class="eyebrow">{{ i18n.tx().trustSection.eyebrow }}</p>
        <h2>{{ i18n.tx().trustSection.heading }}</h2>
        <p>{{ i18n.tx().trustSection.p }}</p>
      </div>
      <div class="trust-grid">
        <div *ngFor="let item of i18n.tx().trustItems"><strong>{{ item.value }}</strong><span>{{ item.label }}</span></div>
      </div>
    </section>
    <section class="destinations-section">
      <div class="section-heading">
        <p class="eyebrow">{{ i18n.tx().destSection.eyebrow }}</p>
        <h2>{{ i18n.tx().destSection.heading }}</h2>
      </div>
      <div class="destination-grid">
        <article class="destination-card" *ngFor="let place of state.places.slice(0, 4)">
          <img [src]="place.image" [alt]="place.name">
          <div><span>{{ place.zone }}</span><h3>{{ place.name }}</h3><p>{{ place.description }}</p></div>
        </article>
      </div>
    </section>
    <section class="split-cta">
      <div>
        <p class="eyebrow">{{ i18n.tx().splitCta.eyebrow }}</p>
        <h2>{{ i18n.tx().splitCta.heading }}</h2>
      </div>
      <a routerLink="/reservation" class="cta-button">{{ i18n.tx().splitCta.btn }}</a>
    </section>
    <section class="experience-section">
      <div class="experience-media"><img src="assets/images/bus.png" alt="Private shuttle van"></div>
      <div class="experience-copy">
        <p class="eyebrow">{{ i18n.tx().experienceSection.eyebrow }}</p>
        <h2>{{ i18n.tx().experienceSection.heading }}</h2>
        <p>{{ i18n.tx().experienceSection.p }}</p>
        <div class="experience-list">
          <span *ngFor="let item of i18n.tx().experienceSection.items">{{ item }}</span>
        </div>
      </div>
    </section>
    <section class="testimonials-section">
      <div class="section-heading centered">
        <p class="eyebrow">{{ i18n.tx().testimonialSection.eyebrow }}</p>
        <h2>{{ i18n.tx().testimonialSection.heading }}</h2>
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
        <p class="eyebrow">{{ i18n.tx().finalCta.eyebrow }}</p>
        <h2>{{ i18n.tx().finalCta.heading }}</h2>
      </div>
      <a class="cta-button" routerLink="/reservation">{{ i18n.tx().finalCta.btn }}</a>
    </section>
  `
})
export class HomePageComponent {
  constructor(public readonly state: TravelStateService, public readonly i18n: I18nService) {}
}

@Component({
  standalone: true,
  imports: [CommonModule, PageHeroComponent],
  template: `
    <app-page-hero [title]="i18n.tx().servicesPage.title" [eyebrow]="i18n.tx().servicesPage.eyebrow" [text]="i18n.tx().servicesPage.text"></app-page-hero>
    <section class="services-section page-content">
      <div class="service-grid">
        <article class="service-card" *ngFor="let service of i18n.tx().services">
          <div class="service-icon" [ngSwitch]="service.icon">
            <svg *ngSwitchCase="'AIR'" viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 16.5 21 3.5l-5 17-4.4-7.1-6.8 3.3-2.3-.2Zm4.8-2.8 5.1-2.5 2.3 3.7 2.5-8.6-9.9 7.4Z"/></svg>
            <svg *ngSwitchCase="'H2H'" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V9.7L12 4l8 5.7V20h-5.7v-6.1H9.7V20H4Zm2-2h1.7v-6.1h8.6V18H18v-7.2l-6-4.3-6 4.3V18Z"/></svg>
            <svg *ngSwitchCase="'ADD'" viewBox="0 0 24 24" aria-hidden="true"><path d="M11 13H5v-2h6V5h2v6h6v2h-6v6h-2v-6Z"/><path d="M4 4h5v2H6v3H4V4Zm11 0h5v5h-2V6h-3V4ZM4 15h2v3h3v2H4v-5Zm14 0h2v5h-5v-2h3v-3Z"/></svg>
          </div>
          <h3>{{ service.title }}</h3>
          <p>{{ service.text }}</p>
        </article>
      </div>
    </section>
    <section class="trust-band">
      <div class="trust-copy">
        <p class="eyebrow">{{ i18n.tx().trustSection.eyebrow }}</p>
        <h2>{{ i18n.tx().trustSection.heading }}</h2>
        <p>{{ i18n.tx().trustSection.p }}</p>
      </div>
      <div class="trust-grid">
        <div *ngFor="let item of i18n.tx().trustItems"><strong>{{ item.value }}</strong><span>{{ item.label }}</span></div>
      </div>
    </section>
  `
})
export class ServicesPageComponent {
  constructor(public readonly i18n: I18nService) {}
}

@Component({
  standalone: true,
  imports: [CommonModule, PageHeroComponent],
  template: `
    <app-page-hero [title]="i18n.tx().fleetPage.title" [eyebrow]="i18n.tx().fleetPage.eyebrow" [text]="i18n.tx().fleetPage.text"></app-page-hero>
    <section class="fleet-section page-content">
      <div class="fleet-grid">
        <ng-container *ngIf="state.carTypes().length; else staticFleet">
          <article class="fleet-card" *ngFor="let ct of state.carTypes()">
            <img src="assets/images/bus.png" [alt]="ct.name">
            <div>
              <h3>{{ ct.name }}</h3>
              <p>{{ ct.description }}</p>
              <span class="fleet-capacity">{{ i18n.tx().booking.upTo }} {{ ct.capacity }} {{ i18n.tx().booking.pax }}<ng-container *ngIf="ct.maxExtraPassengers > 0"> (+{{ ct.maxExtraPassengers }} extra)</ng-container></span>
            </div>
          </article>
        </ng-container>
        <ng-template #staticFleet>
          <article class="fleet-card" *ngFor="let item of i18n.tx().fleetHighlights">
            <img src="assets/images/bus.png" alt="Private shuttle vehicle">
            <div><h3>{{ item.title }}</h3><p>{{ item.text }}</p></div>
          </article>
        </ng-template>
      </div>
    </section>
  `
})
export class FleetPageComponent {
  constructor(public readonly i18n: I18nService, public readonly state: TravelStateService) {}
}

@Component({
  standalone: true,
  imports: [CommonModule, PageHeroComponent],
  template: `
    <app-page-hero [title]="i18n.tx().destPage.title" [eyebrow]="i18n.tx().destPage.eyebrow" [text]="i18n.tx().destPage.text"></app-page-hero>
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
  constructor(public readonly state: TravelStateService, public readonly i18n: I18nService) {}
}

@Component({
  standalone: true,
  imports: [CommonModule, PageHeroComponent],
  template: `
    <app-page-hero [title]="i18n.tx().testimonialsPage.title" [eyebrow]="i18n.tx().testimonialsPage.eyebrow" [text]="i18n.tx().testimonialsPage.text"></app-page-hero>
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
  constructor(public readonly state: TravelStateService, public readonly i18n: I18nService) {}
}

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [CommonModule, FormsModule, PhoneFieldComponent, RouterLink],
  template: `
    <form class="reservation-form" #reservationForm="ngForm" (ngSubmit)="state.submitReservation()">
      <input name="name" [placeholder]="i18n.tx().reservation.firstName" [(ngModel)]="state.customer.name" required>
      <input name="lastName" [placeholder]="i18n.tx().reservation.lastName" [(ngModel)]="state.customer.lastName" required>
      <app-phone-field name="phone" [placeholder]="i18n.tx().signup.phonePlaceholder" [required]="true" [(ngModel)]="state.customer.phone"></app-phone-field>
      <input name="email" type="email" placeholder="Email" [(ngModel)]="state.customer.email" required>
      <textarea name="notes" [placeholder]="i18n.tx().reservation.notes" rows="4" [(ngModel)]="state.customer.notes"></textarea>
      <div class="submit-row">
        <button type="submit" class="primary-action" [disabled]="reservationForm.invalid || !state.canSubmitReservation()">{{ i18n.tx().reservation.sendBtn }}</button>
      </div>
      <div class="reservation-success" *ngIf="state.reservationSent()">
        <p class="eyebrow">{{ i18n.tx().reservation.successEyebrow }}</p>
        <h3>{{ i18n.tx().reservation.successHeading }}</h3>
        <p>{{ i18n.tx().reservation.successMsg }}</p>
        <ul class="reservation-success-steps">
          <li *ngFor="let step of i18n.tx().reservation.successSteps">{{ step }}</li>
        </ul>
        <a routerLink="/account" class="secondary-action">{{ i18n.tx().reservation.successAccountBtn }}</a>
      </div>
      <p class="error" *ngIf="state.reservationError()">{{ state.reservationError() }}</p>
    </form>
  `
})
export class ReservationFormComponent {
  constructor(public readonly state: TravelStateService, public readonly i18n: I18nService) {}
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeroComponent, BookingCardComponent, ReservationFormComponent],
  template: `
    <section class="reservation-page">
      <div class="reservation-shell">
        <div class="reservation-heading">
          <p class="eyebrow">{{ i18n.tx().reservation.eyebrow }}</p>
          <h1>{{ i18n.tx().reservation.heading }}</h1>
        </div>

        <div class="passenger-alert" *ngIf="hasLargeParty()">{{ i18n.tx().reservation.largeParty }}</div>

        <div class="transfer-list">
          <div class="transfer-item" *ngFor="let transfer of state.reservationShuttles(); let index = index">
            <app-booking-card [quote]="transfer" [compact]="true" [number]="index + 1"></app-booking-card>
            <button type="button" class="remove-transfer"
              *ngIf="state.reservationShuttles().length > 1"
              (click)="state.removeReservationShuttle(transfer.uid)">
              {{ i18n.tx().reservation.removeTransfer }}
            </button>
          </div>
        </div>

        <div class="transfer-actions">
          <button type="button" class="secondary-action" (click)="state.addReservationShuttle()">{{ i18n.tx().reservation.addTransfer }}</button>
        </div>

        <section class="details-panel">
          <div class="panel-heading">
            <p class="eyebrow">{{ i18n.tx().reservation.travelerEyebrow }}</p>
            <h2>{{ i18n.tx().reservation.travelerHeading }}</h2>
          </div>
          <app-reservation-form></app-reservation-form>
        </section>
      </div>
    </section>
  `
})
export class ReservationPageComponent {
  constructor(public readonly state: TravelStateService, public readonly i18n: I18nService) {
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
  imports: [CommonModule, PageHeroComponent],
  template: `
    <app-page-hero [title]="i18n.tx().aboutPage.title" [eyebrow]="i18n.tx().aboutPage.eyebrow" [text]="i18n.tx().aboutPage.text"></app-page-hero>
    <section class="experience-section">
      <div class="experience-media"><img src="assets/images/bus.png" alt="Private shuttle van"></div>
      <div class="experience-copy">
        <p class="eyebrow">{{ i18n.tx().aboutPage.rideEyebrow }}</p>
        <h2>{{ i18n.tx().aboutPage.rideHeading }}</h2>
        <p>{{ i18n.tx().aboutPage.rideP }}</p>
        <div class="experience-list">
          <span *ngFor="let item of i18n.tx().aboutPage.rideItems">{{ item }}</span>
        </div>
      </div>
    </section>
  `
})
export class AboutPageComponent {
  constructor(public readonly i18n: I18nService) {}
}

@Component({
  standalone: true,
  imports: [CommonModule, PageHeroComponent, ReservationFormComponent],
  template: `
    <app-page-hero [title]="i18n.tx().contactPage.title" [eyebrow]="i18n.tx().contactPage.eyebrow" [text]="i18n.tx().contactPage.text"></app-page-hero>
    <section class="reservation-section page-content-dark">
      <div class="reservation-copy">
        <p class="eyebrow">{{ i18n.tx().contactPage.formEyebrow }}</p>
        <h2>{{ i18n.tx().contactPage.formHeading }}</h2>
        <p>{{ i18n.tx().contactPage.formP }}</p>
      </div>
      <app-reservation-form></app-reservation-form>
    </section>
  `
})
export class ContactPageComponent {
  constructor(public readonly i18n: I18nService) {}
}

@Component({
  standalone: true,
  imports: [CommonModule, PageHeroComponent],
  template: `
    <app-page-hero title="Booking & Cancellation Policy" eyebrow="Policies" text="Please read the following before booking."></app-page-hero>
    <section class="policy-page page-band">
      <div class="policy-content" *ngIf="policyText">
        <p *ngFor="let para of paragraphs">{{ para }}</p>
      </div>
      <p class="policy-placeholder" *ngIf="!policyText">Policy information will be available soon. Contact us for details.</p>
    </section>
  `
})
export class PolicyPageComponent {
  policyText = '';

  constructor(private readonly http: HttpClient) {
    this.http.get<any>(`${API}/company`).subscribe({
      next: (company) => { if (company && company.cancellationPolicyText) this.policyText = company.cancellationPolicyText; },
      error: () => {}
    });
  }

  get paragraphs(): string[] {
    return this.policyText.split(/\n+/).filter((p) => p.trim());
  }
}
