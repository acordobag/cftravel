import { HttpClient } from '@angular/common/http';
import { Injectable, computed, effect, signal, untracked } from '@angular/core';

import { AuthService } from './auth.service';
import { CarType, CompanyProfile, ContactMethod, PlaceOption, ReservationPayload, ShuttleQuote, Testimonial } from './models';
import { PricingService } from './pricing.service';

import { environment } from '../environments/environment';
const API_URL = environment.apiUrl;
declare const google: any;

@Injectable({ providedIn: 'root' })
export class TravelStateService {
  readonly today = new Date().toISOString().slice(0, 10);
  heroImages = ['assets/images/banner_0.jpg', 'assets/images/banner_1.png'];
  readonly activeHero = signal(0);
  readonly activeTestimonial = signal(0);
  readonly reservationSent = signal(false);
  readonly reservationError = signal('');
  readonly isCalculatingRate = signal(false);
  readonly rateError = signal('');
  readonly reservationShuttles = signal<ShuttleQuote[]>([]);
  readonly carTypes = this.pricing.carTypes;

  places: PlaceOption[] = [
    { id: 1, name: 'SJO Airport', zone: 'Alajuela', image: 'assets/images/airport.jpg', description: 'Reliable airport pickups and departures around San Jose.', airportDistance: 0, placeId: 'ChIJc3hQUMT5oI8RpDE_DiJie7I', location: { lat: 9.9980535, lng: -84.2040896 } },
    { id: 2, name: 'La Fortuna / Arenal', zone: 'Northern Highlands', image: 'assets/images/arenal.jpg', description: 'Private rides to hot springs, lodges, and volcano views.', airportDistance: 116, location: { lat: 10.4678, lng: -84.6427 } },
    { id: 3, name: 'Jaco Beach', zone: 'Central Pacific', image: 'assets/images/jaco.jpg', description: 'Coastal transfers for surf trips and marina connections.', airportDistance: 87, location: { lat: 9.6149, lng: -84.6298 } },
    { id: 4, name: 'Manuel Antonio', zone: 'Central Pacific', image: 'assets/images/t1.jpg', description: 'Hotel-to-hotel transfers to Quepos and Manuel Antonio.', airportDistance: 155, location: { lat: 9.3923, lng: -84.1368 } },
    { id: 5, name: 'Monteverde', zone: 'Cloud Forest', image: 'assets/images/h1.jpg', description: 'Mountain road transfers with planned comfort stops.', airportDistance: 133, location: { lat: 10.3000, lng: -84.8167 } },
    { id: 6, name: 'Tamarindo', zone: 'Guanacaste', image: 'assets/images/c1.jpg', description: 'Long-distance private shuttles to northern beaches.', airportDistance: 255, location: { lat: 10.2993, lng: -85.8371 } }
  ];

  readonly services = [
    { icon: 'AIR', title: 'Airport pickups', text: 'Private arrivals and departures from SJO and Liberia with flight-aware scheduling.' },
    { icon: 'H2H', title: 'Hotel to hotel', text: 'Point-to-point transfers between beaches, volcano towns, national parks, and villas.' },
    { icon: 'ADD', title: 'Multi-stop days', text: 'Add lunch, grocery stops, viewpoints, or custom route pauses before confirmation.' }
  ];

  readonly trustItems = [
    { value: 'Route-based', label: 'Pricing logic' },
    { value: 'Private', label: 'Vehicle assignment' },
    { value: 'Flexible', label: 'Stops and schedules' },
    { value: 'Local', label: 'Costa Rica routing' }
  ];

  readonly confidenceItems = [
    { icon: 'SAFE', title: 'Safe & insured', text: 'Professional drivers, clean vehicles, and transfer planning built for Costa Rica roads.' },
    { icon: 'TIME', title: 'Flight-aware timing', text: 'Airport pickups are planned around arrival windows, delays, luggage, and immigration time.' },
    { icon: 'CHAT', title: 'Fast trip support', text: 'Clear communication before your ride, with route notes and schedule changes handled early.' },
    { icon: 'VIP', title: 'Private comfort', text: 'Door-to-door Toyota HiAce service with room for families, luggage, custom stops, and longer travel days.' },
    { icon: 'PRICE', title: 'Transparent fares', text: 'Route and operations distance stay visible so pricing feels easier to understand.' },
    { icon: 'FAMILY', title: 'Family friendly', text: 'Comfort stops, direct hotel pickups, and vehicle planning for groups or extra bags.' }
  ];

  readonly routeHighlights = [
    { value: 'SJO & LIR', label: 'Airport transfers' },
    { value: '24/7', label: 'Travel-day support' },
    { value: '4.9', label: 'Guest-style rating' }
  ];

  company: CompanyProfile = this.defaultCompany();
  contactPhones = this.company.phones.filter((contact) => contact.type === 'phone').map((contact) => this.toDisplayContact(contact));
  contactLinks = this.company.phones.map((contact) => this.toDisplayContact(contact));

  get whatsappHref(): string {
    return this.contactLinks.find((contact) => contact.type === 'whatsapp')?.href || '/contact-us';
  }

  readonly bookingSteps = [
    { step: '01', title: 'Choose your route', text: 'Search your pickup and drop-off, then select passengers, date, and time.' },
    { step: '02', title: 'Review the fare', text: 'See route distance, operations distance, and the estimated private transfer fare.' },
    { step: '03', title: 'Confirm with support', text: 'Send your request and we confirm vehicle, timing, stops, and final details.' }
  ];

  readonly fleetHighlights = [
    { title: 'Toyota HiAce 2026', text: 'Modern private shuttle van with air conditioning, generous luggage space, comfortable seating, and flexible stops for airport, beach, and hotel-to-hotel routes.' }
  ];

  readonly rateNotes = [
    'No shared shuttle stops unless you request them',
    'Route-aware pricing with clear distance breakdowns',
    'Custom stops reviewed before final confirmation'
  ];

  readonly assuranceBadges = [
    'Flight-aware pickups',
    'Door-to-door service',
    'WhatsApp support',
    'Private routes',
    'Family friendly',
    'Custom stops'
  ];

  readonly quote: ShuttleQuote = this.createQuote(0, true);

  readonly customer = {
    name: '',
    lastName: '',
    phone: '',
    email: '',
    notes: ''
  };

  readonly testimonials = signal<Testimonial[]>(this.defaultTestimonials());
  readonly currentTestimonial = computed(() => this.testimonials()[this.activeTestimonial()] || this.testimonials()[0]);

  constructor(private readonly http: HttpClient, private readonly pricing: PricingService, private readonly auth: AuthService) {
    this.recalculate();
    effect(() => {
      this.pricing.pricingConfig();
      this.recalculate();
      this.reservationShuttles.update((shuttles) => shuttles.map((shuttle) => {
        this.recalculate(shuttle);
        return shuttle;
      }));
    }, { allowSignalWrites: true });
    effect(() => {
      const user = this.auth.currentUser();
      if (user) {
        this.customer.name = this.customer.name || user.name;
        this.customer.lastName = this.customer.lastName || user.lastName;
        this.customer.email = this.customer.email || user.email;
        this.customer.phone = this.customer.phone || user.phone || '';
      }
    });
    this.loadPlaces();
    this.loadHeroImages();
    this.loadCompany();
    this.loadTestimonials();
    window.setInterval(() => this.activeHero.update((value) => (value + 1) % this.heroImages.length), 5200);
  }

  recalculate(quote = this.quote): void {
    if (!quote.departing || !quote.destination || quote.departing.id === quote.destination.id) {
      quote.routeDistance = 0;
      quote.repositionDistance = 0;
      quote.vehicleSurcharge = 0;
      quote.total = 0;
      return;
    }

    const routeDistance = Math.abs(quote.departing.airportDistance - quote.destination.airportDistance) || Math.max(quote.departing.airportDistance, quote.destination.airportDistance);
    const startsAtAirport = quote.departing.id === 1;
    const repositionDistance = startsAtAirport ? 0 : Math.max(quote.departing.airportDistance, quote.destination.airportDistance);

    quote.routeDistance = Math.round(routeDistance);
    quote.repositionDistance = Math.round(repositionDistance);
    quote.vehicleSurcharge = this.pricing.vehicleSurcharge(quote.passengers, quote.carTypeId);

    const isRoundTrip = untracked(() => this.reservationShuttles()).some(
      (s) => s.uid !== quote.uid && s.departing && s.destination && s.departing.id === quote.destination!.id && s.destination.id === quote.departing!.id
    );
    quote.total = this.pricing.estimate(quote.routeDistance, quote.repositionDistance, quote.departing.id, quote.destination.id, isRoundTrip) + quote.vehicleSurcharge;
  }

  selectKnownPlace(quote: ShuttleQuote, kind: 'departing' | 'destination', name: string): void {
    const match = this.places.find((place) => place.name.toLowerCase() === name.trim().toLowerCase());

    if (kind === 'departing') {
      quote.departingSearch = name;
      quote.departing = match || null;
    } else {
      quote.destinationSearch = name;
      quote.destination = match || null;
    }

    quote.rateError = '';
    this.recalculate(quote);
  }

  private matchKnownPlace(googlePlaceId: string | undefined, candidateName: string, location?: { lat: number; lng: number }): PlaceOption | null {
    const stripDiacritics = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
    const normalize = (value: string) => stripDiacritics(value.toLowerCase().trim());
    const candidate = normalize(candidateName || '');

    const byIdOrName = this.places.find((item) => {
      if (googlePlaceId && item.placeId && item.placeId === googlePlaceId) {
        return true;
      }
      const itemName = normalize(item.name);
      return itemName === candidate || (candidate && (candidate.includes(itemName) || itemName.includes(candidate)));
    });

    if (byIdOrName) return byIdOrName;

    if (location) {
      const deg2km = (lat1: number, lng1: number, lat2: number, lng2: number) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      };
      return this.places.find((item) => {
        if (!item.location) return false;
        return deg2km(location.lat, location.lng, item.location.lat, item.location.lng) < 15;
      }) || null;
    }

    return null;
  }

  async setGooglePlace(quote: ShuttleQuote, kind: 'departing' | 'destination', place: any): Promise<void> {
    if (!place || !place.geometry || !place.geometry.location) {
      return;
    }

    const location = {
      lat: typeof place.geometry.location.lat === 'function' ? place.geometry.location.lat() : place.geometry.location.lat,
      lng: typeof place.geometry.location.lng === 'function' ? place.geometry.location.lng() : place.geometry.location.lng
    };

    const placeName = place.name || place.formatted_address || '';

    // If the Google suggestion matches one of our own places (by Google place_id or by name),
    // reuse that place's real id so fixed-route prices set in the admin keep applying.
    // Otherwise this would always be a brand-new id and admin fixed routes would never match.
    const known = this.matchKnownPlace(place.place_id, placeName, location);

    const option: PlaceOption = known || {
      id: Date.now(),
      name: placeName,
      zone: 'Costa Rica',
      image: 'assets/images/airport.jpg',
      description: place.formatted_address || 'Custom Costa Rica pickup or drop-off.',
      airportDistance: 0,
      placeId: place.place_id,
      location
    };

    if (kind === 'departing') {
      quote.departingSearch = option.name;
      quote.departing = option;
    } else {
      quote.destinationSearch = option.name;
      quote.destination = option;
    }

    await this.calculateGoogleRate(quote);
  }

  async calculateGoogleRate(quote = this.quote): Promise<void> {
    quote.rateError = '';

    if (!quote.departing || !quote.destination) {
      this.recalculate(quote);
      return;
    }

    const maps = (globalThis as any).google?.maps;
    if (!maps?.DirectionsService || !quote.departing.location || !quote.destination.location) {
      this.recalculate(quote);
      return;
    }

    quote.isCalculating = true;

    try {
      const routeDistance = await this.getRouteDistance(quote.departing.location, quote.destination.location);
      const startsAtAirport = quote.departing.placeId === this.places[0].placeId || quote.departing.name.toLowerCase().includes('airport');
      let repositionDistance = 0;

      if (!startsAtAirport) {
        const airport = this.places[0].location!;
        const departingDistance = await this.getRouteDistance(airport, quote.departing.location);
        const destinationDistance = await this.getRouteDistance(airport, quote.destination.location);
        repositionDistance = Math.max(departingDistance, destinationDistance);
      }

      quote.routeDistance = Math.round(routeDistance);
      quote.repositionDistance = Math.round(repositionDistance);
      quote.vehicleSurcharge = this.pricing.vehicleSurcharge(quote.passengers, quote.carTypeId);
      quote.total = this.pricing.estimate(quote.routeDistance, quote.repositionDistance, quote.departing.id, quote.destination.id) + quote.vehicleSurcharge;
    } catch {
      quote.rateError = 'We could not calculate this route yet. Please check both locations.';
      this.recalculate(quote);
    } finally {
      quote.isCalculating = false;
    }
  }

  startReservationFromQuote(): void {
    this.reservationShuttles.set([this.cloneQuote(this.quote)]);
  }

  addReservationShuttle(): void {
    const next = this.createQuote(this.reservationShuttles().length, true);
    this.recalculate(next);
    this.reservationShuttles.update((shuttles) => [...shuttles, next]);
  }

  removeReservationShuttle(uid: number): void {
    this.reservationShuttles.update((shuttles) => shuttles.length > 1 ? shuttles.filter((quote) => quote.uid !== uid) : shuttles);
  }

  validReservationShuttles(): ShuttleQuote[] {
    const shuttles = this.reservationShuttles().length ? this.reservationShuttles() : [this.quote];
    return shuttles.filter((quote) => quote.departing && quote.destination && quote.total > 0);
  }

  nextTestimonial(): void {
    this.activeTestimonial.update((value) => (value + 1) % this.testimonials().length);
  }

  previousTestimonial(): void {
    this.activeTestimonial.update((value) => value === 0 ? this.testimonials().length - 1 : value - 1);
  }

  submitReservation(): void {
    this.reservationSent.set(false);
    this.reservationError.set('');

    const shuttles = this.validReservationShuttles();

    if (!shuttles.length || shuttles.length !== (this.reservationShuttles().length || 1)) {
      this.reservationError.set('Please complete every transfer before sending the request.');
      return;
    }

    const payload: ReservationPayload = {
      user: {
        name: this.customer.name,
        lastName: this.customer.lastName,
        phone: this.customer.phone,
        email: this.customer.email
      },
      message: this.customer.notes,
      shuttles: shuttles.map((quote) => ({
        departing: { id: quote.departing!.id, name: quote.departing!.name },
        destination: { id: quote.destination!.id, name: quote.destination!.name },
        date: `${quote.date}T${quote.time}`,
        persons: quote.passengers,
        rate: quote.total,
        distance: quote.routeDistance
      }))
    };

    this.http.post(`${API_URL}/reservation`, payload).subscribe({
      next: () => this.reservationSent.set(true),
      error: () => this.reservationError.set('The local API is not available yet, but your route is ready to quote.')
    });
  }

  canSubmitReservation(): boolean {
    const expected = this.reservationShuttles().length || 1;
    return this.validReservationShuttles().length === expected;
  }

  formatMoney(value: number): string {
    return Number(value || 0).toFixed(2);
  }

  private loadPlaces(): void {
    this.http.get<any[]>(`${API_URL}/place`).subscribe({
      next: (places) => {
        if (!places.length) {
          return;
        }

        this.places = places.map((place, index) => {
          const fallback = this.places.find((item) => item.name.toLowerCase() === String(place.name).toLowerCase()) || this.places[index] || this.places[0];
          const image = place.images && place.images.length ? place.images[0].src : fallback.image;

          return {
            ...fallback,
            id: place.id,
            name: place.name,
            description: place.description || fallback.description,
            image
          };
        });

        this.quote.departing = this.places[0] || this.quote.departing;
        this.quote.destination = this.places[1] || this.quote.destination;
        this.quote.departingSearch = this.quote.departing?.name || '';
        this.quote.destinationSearch = this.quote.destination?.name || '';
        this.recalculate();
      }
    });
  }

  private loadHeroImages(): void {
    this.http.get<Array<{ src: string }>>(`${API_URL}/hero-image`).subscribe({
      next: (images) => {
        if (images.length) {
          this.heroImages = images.map((image) => image.src);
        }
      }
    });
  }

  private loadTestimonials(): void {
    this.http.get<Testimonial[]>(`${API_URL}/testimonial`).subscribe({
      next: (testimonials) => {
        if (testimonials.length) {
          this.testimonials.set(testimonials);
        }
      },
      error: () => this.testimonials.set(this.defaultTestimonials())
    });
  }

  private loadCompany(): void {
    this.http.get<CompanyProfile | null>(`${API_URL}/company`).subscribe({
      next: (company) => {
        if (!company) {
          return;
        }

        this.company = { ...company, phones: company.phones || [] };
        this.contactPhones = this.company.phones
          .filter((contact) => contact.active !== false && contact.type === 'phone')
          .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
          .map((contact) => this.toDisplayContact(contact));
        this.contactLinks = this.company.phones
          .filter((contact) => contact.active !== false)
          .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
          .map((contact) => this.toDisplayContact(contact));
      }
    });
  }

  private getRouteDistance(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }): Promise<number> {
    return new Promise((resolve, reject) => {
      const service = new google.maps.DirectionsService();
      service.route({
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true
      }, (response: any, status: string) => {
        const leg = response?.routes?.[0]?.legs?.[0];
        if (status !== 'OK' || !leg?.distance?.value) {
          reject(status);
          return;
        }

        resolve(leg.distance.value / 1000);
      });
    });
  }

  private createQuote(offset = 0, blank = false): ShuttleQuote {
    return {
      uid: Date.now() + offset,
      departing: blank ? null : this.places[0],
      destination: blank ? null : this.places[1],
      departingSearch: blank ? '' : this.places[0].name,
      destinationSearch: blank ? '' : this.places[1].name,
      passengers: 2,
      carTypeId: null,
      date: this.today,
      time: '08:00',
      routeDistance: 0,
      repositionDistance: 0,
      vehicleSurcharge: 0,
      total: 0,
      isCalculating: false,
      rateError: ''
    };
  }

  private cloneQuote(quote: ShuttleQuote): ShuttleQuote {
    return {
      ...quote,
      uid: Date.now(),
      departing: quote.departing ? { ...quote.departing } : null,
      destination: quote.destination ? { ...quote.destination } : null
    };
  }

  private defaultTestimonials(): Testimonial[] {
    return [
      { id: 1, name: 'Mariana G.', location: 'San Jose, Costa Rica', route: 'SJO Airport to La Fortuna', rating: 5, comment: 'The pickup was on time, the van was spotless, and the driver helped us plan a comfortable stop on the way to Arenal.', active: true },
      { id: 2, name: 'David R.', location: 'Austin, USA', route: 'Jaco to Manuel Antonio', rating: 5, comment: 'Clear pricing before booking and a relaxed private ride after a long travel day.', active: true },
      { id: 3, name: 'Sofia L.', location: 'Madrid, Spain', route: 'Liberia Airport to Tamarindo', rating: 5, comment: 'Our driver tracked the arrival time and was waiting when we landed. The whole transfer was smooth.', active: true }
    ];
  }

  private defaultCompany(): CompanyProfile {
    return {
      name: 'CR Travel Service',
      email: 'reservations@crtravelservice.com',
      tagline: 'Private shuttle transportation in Costa Rica',
      address: 'Costa Rica',
      website: 'https://crtravelservice.com',
      isDefault: true,
      phones: [
        { type: 'phone', label: 'Costa Rica', code: 'Costa Rica', number: '+506 0000-0000', href: 'tel:+50600000000', active: true, sortOrder: 1 },
        { type: 'phone', label: 'US & Canada', code: 'US & Canada', number: '+1 (800) 000-0000', href: 'tel:+18000000000', active: true, sortOrder: 2 },
        { type: 'whatsapp', label: 'WhatsApp', code: 'WhatsApp', number: '+506 0000-0000', href: 'https://wa.me/50600000000', active: true, sortOrder: 3 },
        { type: 'email', label: 'Email', code: 'Email', number: 'reservations@crtravelservice.com', href: 'mailto:reservations@crtravelservice.com', active: true, sortOrder: 4 }
      ]
    };
  }

  private toDisplayContact(contact: ContactMethod): { label: string; value: string; href: string; type: string } {
    return {
      label: contact.label || contact.code || contact.type,
      value: contact.number,
      href: contact.href || (contact.type === 'email' ? `mailto:${contact.number}` : contact.type === 'phone' ? `tel:${contact.number.replace(/[^+0-9]/g, '')}` : '/contact-us'),
      type: contact.type
    };
  }
}
