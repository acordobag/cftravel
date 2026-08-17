import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';

import { BookingPolicy, CarType } from './models';

import { environment } from '../environments/environment';
const API_URL = environment.apiUrl;

export interface PriceRule {
  id?: number;
  name: string;
  minDistance: number;
  maxDistance: number;
  baseFare: number;
  pricePerKm: number;
  operationsRatePerKm: number | null;
  discount: number;
  active: boolean;
  sortOrder: number;
}

export interface PricingZone {
  id?: number;
  code: string;
  name: string;
  originPlaceId: number;
  oneWayPrice: number;
  roundTripPrice: number | null;
  notes: string;
  requiresReview: boolean;
  active: boolean;
  sortOrder: number;
  origin?: { id: number; name: string };
}

export interface FixedRoutePrice {
  id?: number;
  departingId: number;
  destinationId: number;
  price: number;
  roundTripPrice: number | null;
  label: string;
  notes: string;
  active: boolean;
  departing?: { id: number; name: string };
  destination?: { id: number; name: string };
}

export interface ServicePricingRule {
  id?: number;
  title: string;
  description: string;
  active: boolean;
  sortOrder: number;
}

export interface PricingConfig {
  pricingRules: PriceRule[];
  pricingZones: PricingZone[];
  fixedRoutePrices: FixedRoutePrice[];
  serviceRules: ServicePricingRule[];
  carTypes: CarType[];
  bookingPolicy?: BookingPolicy;
}

@Injectable({ providedIn: 'root' })
export class PricingService {
  private readonly basePassengerCapacity = 4;
  private readonly defaultExtraPassengerCharge = 20;

  readonly pricingConfig = signal<PricingConfig>({
    pricingRules: this.defaultRateRules(),
    pricingZones: [],
    fixedRoutePrices: [],
    serviceRules: [],
    carTypes: [],
    bookingPolicy: undefined
  });

  readonly bookingPolicy = computed(() => this.pricingConfig().bookingPolicy);

  readonly carTypes = computed(() => this.pricingConfig().carTypes);

  constructor(private readonly http: HttpClient) {
    this.loadPricing();
  }

  loadPricing(): void {
    this.http.get<PricingConfig>(`${API_URL}/pricing`).subscribe({
      next: (config) => {
        this.pricingConfig.set({
          pricingRules: config.pricingRules?.length ? config.pricingRules : this.defaultRateRules(),
          pricingZones: config.pricingZones || [],
          fixedRoutePrices: config.fixedRoutePrices || [],
          serviceRules: config.serviceRules || [],
          carTypes: config.carTypes || [],
          bookingPolicy: config.bookingPolicy
        });
      }
    });
  }

  getCarType(carTypeId: number | null): CarType | null {
    if (!carTypeId) return null;
    return this.carTypes().find((ct) => ct.id === carTypeId) || null;
  }

  vehicleSurcharge(passengers: number, carTypeId: number | null): number {
    const carType = this.getCarType(carTypeId);
    if (carType) {
      if (carType.extraPassengerCharge <= 0) return 0;
      const extra = Math.max(0, passengers - carType.capacity);
      const capped = Math.min(extra, carType.maxExtraPassengers);
      return this.roundMoney(capped * carType.extraPassengerCharge);
    }

    const extra = Math.max(0, Number(passengers || 0) - this.basePassengerCapacity);
    return this.roundMoney(extra * this.defaultExtraPassengerCharge);
  }

  estimate(
    routeDistance: number,
    repositionDistance: number,
    departingId?: number,
    destinationId?: number,
    departingZoneId?: number | null,
    destinationZoneId?: number | null,
    isRoundTrip = false
  ): number {
    const fixedRoute = this.getFixedRoutePrice(departingId, destinationId);
    if (fixedRoute) {
      if (isRoundTrip && fixedRoute.roundTripPrice != null) {
        return this.roundMoney(fixedRoute.roundTripPrice / 2);
      }
      return this.roundMoney(fixedRoute.price);
    }

    const zone = this.getPricingZone(departingId, destinationId, departingZoneId, destinationZoneId);
    if (zone) {
      if (isRoundTrip && zone.roundTripPrice != null) {
        return this.roundMoney(zone.roundTripPrice / 2);
      }
      return this.roundMoney(Number(zone.oneWayPrice));
    }

    const routeRate = this.getKilometerRate(routeDistance);
    const routeSubtotal = Number(routeRate.baseFare || 0) + routeDistance * Number(routeRate.pricePerKm);
    const routeTotal = Math.max(routeSubtotal - routeSubtotal * routeRate.discount, 0);
    const operationsRate = routeRate.operationsRatePerKm == null
      ? Number(routeRate.pricePerKm)
      : Number(routeRate.operationsRatePerKm);
    const repositionTotal = repositionDistance * operationsRate;

    return this.roundMoney(routeTotal + repositionTotal);
  }

  getPricingZone(
    departingId?: number,
    destinationId?: number,
    departingZoneId?: number | null,
    destinationZoneId?: number | null
  ): PricingZone | null {
    if (!departingId || !destinationId) return null;

    return this.pricingConfig().pricingZones.find((zone) => {
      const direct = zone.originPlaceId === departingId && zone.id === destinationZoneId;
      const reverse = zone.originPlaceId === destinationId && zone.id === departingZoneId;
      return zone.active && (direct || reverse);
    }) || null;
  }

  getFixedRoutePrice(departingId?: number, destinationId?: number): FixedRoutePrice | null {
    if (!departingId || !destinationId) {
      return null;
    }

    return this.pricingConfig().fixedRoutePrices.find((route) => {
      const direct = route.departingId === departingId && route.destinationId === destinationId;
      const reverse = route.departingId === destinationId && route.destinationId === departingId;
      return route.active && (direct || reverse);
    }) || null;
  }

  getKilometerRate(distance: number): PriceRule {
    const match = this.pricingConfig().pricingRules.find((rule) =>
      rule.active && (distance > rule.minDistance && distance <= rule.maxDistance || distance === 0 && rule.minDistance === 0)
    );

    return match || {
      name: 'Default fallback',
      minDistance: 0,
      maxDistance: 9999,
      baseFare: 85,
      pricePerKm: 1.5,
      operationsRatePerKm: 0.75,
      discount: 0,
      active: true,
      sortOrder: 999
    };
  }

  private roundMoney(value: number): number {
    return Number(value.toFixed(2));
  }

  private defaultRateRules(): PriceRule[] {
    return [
      {
        name: 'Standard distance fallback',
        minDistance: 0,
        maxDistance: 9999,
        baseFare: 85,
        pricePerKm: 1.5,
        operationsRatePerKm: 0.75,
        discount: 0,
        active: true,
        sortOrder: 1
      }
    ];
  }
}
