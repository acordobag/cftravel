import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';

import { CarType } from './models';

import { environment } from '../environments/environment';
const API_URL = environment.apiUrl;

export interface PriceRule {
  id?: number;
  name: string;
  minDistance: number;
  maxDistance: number;
  pricePerKm: number;
  discount: number;
  active: boolean;
  sortOrder: number;
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
  fixedRoutePrices: FixedRoutePrice[];
  serviceRules: ServicePricingRule[];
  carTypes: CarType[];
}

@Injectable({ providedIn: 'root' })
export class PricingService {
  readonly pricingConfig = signal<PricingConfig>({
    pricingRules: this.defaultRateRules(),
    fixedRoutePrices: [],
    serviceRules: [],
    carTypes: []
  });

  readonly carTypes = computed(() => this.pricingConfig().carTypes);

  constructor(private readonly http: HttpClient) {
    this.loadPricing();
  }

  loadPricing(): void {
    this.http.get<PricingConfig>(`${API_URL}/pricing`).subscribe({
      next: (config) => {
        this.pricingConfig.set({
          pricingRules: config.pricingRules?.length ? config.pricingRules : this.defaultRateRules(),
          fixedRoutePrices: config.fixedRoutePrices || [],
          serviceRules: config.serviceRules || [],
          carTypes: config.carTypes || []
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
    if (!carType || carType.extraPassengerCharge <= 0) return 0;
    const extra = Math.max(0, passengers - carType.capacity);
    const capped = Math.min(extra, carType.maxExtraPassengers);
    return this.roundMoney(capped * carType.extraPassengerCharge);
  }

  estimate(routeDistance: number, repositionDistance: number, departingId?: number, destinationId?: number, isRoundTrip = false): number {
    const fixedRoute = this.getFixedRoutePrice(departingId, destinationId);
    if (fixedRoute) {
      if (isRoundTrip && fixedRoute.roundTripPrice != null) {
        return this.roundMoney(fixedRoute.roundTripPrice);
      }
      return this.roundMoney(fixedRoute.price);
    }

    const routeRate = this.getKilometerRate(routeDistance);
    const repositionRate = this.getKilometerRate(repositionDistance);
    const routeSubtotal = routeDistance * routeRate.pricePerKm;
    const routeTotal = Math.max(routeSubtotal - routeSubtotal * routeRate.discount, 0);
    const repositionTotal = repositionDistance * repositionRate.pricePerKm;

    return this.roundMoney(routeTotal + repositionTotal);
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
      pricePerKm: 0.9,
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
      { name: 'Very short routes', minDistance: 0, maxDistance: 50, pricePerKm: 3.57, discount: 1, active: true, sortOrder: 1 },
      { name: 'Short route promo', minDistance: 55, maxDistance: 65, pricePerKm: 2.24, discount: 0.8, active: true, sortOrder: 2 },
      { name: 'Short routes', minDistance: 50, maxDistance: 75, pricePerKm: 2.24, discount: 0.9, active: true, sortOrder: 3 },
      { name: 'Mid route promo', minDistance: 97.2, maxDistance: 99, pricePerKm: 1.68, discount: 0.9, active: true, sortOrder: 4 },
      { name: 'Mid routes', minDistance: 75, maxDistance: 100, pricePerKm: 1.68, discount: 0.8, active: true, sortOrder: 5 },
      { name: 'Specific route adjustment A', minDistance: 113, maxDistance: 116, pricePerKm: 1.42, discount: 0.3, active: true, sortOrder: 6 },
      { name: 'Specific route adjustment B', minDistance: 124, maxDistance: 126, pricePerKm: 1.42, discount: 0.3, active: true, sortOrder: 7 },
      { name: 'Specific route adjustment C', minDistance: 105, maxDistance: 107, pricePerKm: 1.42, discount: 1.35, active: true, sortOrder: 8 },
      { name: 'Long mid routes', minDistance: 100, maxDistance: 150, pricePerKm: 1.42, discount: 0.55, active: true, sortOrder: 9 },
      { name: 'Long route base', minDistance: 161, maxDistance: 180, pricePerKm: 1.03, discount: 0, active: true, sortOrder: 10 },
      { name: 'Long route adjustment A', minDistance: 180, maxDistance: 185, pricePerKm: 1.03, discount: 0.42, active: true, sortOrder: 11 },
      { name: 'Long route adjustment B', minDistance: 191, maxDistance: 193.1, pricePerKm: 1.43, discount: 1, active: true, sortOrder: 12 },
      { name: 'Extended route adjustment A', minDistance: 205, maxDistance: 215, pricePerKm: 1.03, discount: 0.24, active: true, sortOrder: 13 },
      { name: 'Extended route adjustment B', minDistance: 229, maxDistance: 231, pricePerKm: 1.12, discount: 0.42, active: true, sortOrder: 14 },
      { name: 'Extended route band', minDistance: 230, maxDistance: 259, pricePerKm: 1.12, discount: 0.67, active: true, sortOrder: 15 },
      { name: 'Extended route fallback A', minDistance: 220, maxDistance: 230, pricePerKm: 1.03, discount: 0.4, active: true, sortOrder: 16 },
      { name: 'Extended routes', minDistance: 150, maxDistance: 262, pricePerKm: 1.03, discount: 0.75, active: true, sortOrder: 17 },
      { name: 'Far route adjustment A', minDistance: 262, maxDistance: 264, pricePerKm: 1.07, discount: 0.67, active: true, sortOrder: 18 },
      { name: 'Far route adjustment B', minDistance: 300, maxDistance: 310, pricePerKm: 1.07, discount: 0.16, active: true, sortOrder: 19 },
      { name: 'Far routes', minDistance: 264, maxDistance: 315, pricePerKm: 1.07, discount: 0.3, active: true, sortOrder: 20 },
      { name: 'Far route adjustment C', minDistance: 315, maxDistance: 320, pricePerKm: 1.07, discount: 0.22, active: true, sortOrder: 21 },
      { name: 'Very far routes', minDistance: 320, maxDistance: 370, pricePerKm: 0.9, discount: 0.07, active: true, sortOrder: 22 }
    ];
  }
}
