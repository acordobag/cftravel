import { Injectable } from '@angular/core';

interface PriceRule {
  min: number;
  max: number;
  price: number;
  discount: number;
}

@Injectable({ providedIn: 'root' })
export class PricingService {
  private readonly rateRules: PriceRule[] = [
    { min: 0, max: 50, price: 3.57, discount: 1 },
    { min: 55, max: 65, price: 2.24, discount: 0.8 },
    { min: 50, max: 75, price: 2.24, discount: 0.9 },
    { min: 97.2, max: 99, price: 1.68, discount: 0.9 },
    { min: 75, max: 100, price: 1.68, discount: 0.8 },
    { min: 113, max: 116, price: 1.42, discount: 0.3 },
    { min: 124, max: 126, price: 1.42, discount: 0.3 },
    { min: 105, max: 107, price: 1.42, discount: 1.35 },
    { min: 100, max: 150, price: 1.42, discount: 0.55 },
    { min: 161, max: 180, price: 1.03, discount: 0 },
    { min: 180, max: 185, price: 1.03, discount: 0.42 },
    { min: 191, max: 193.1, price: 1.43, discount: 1 },
    { min: 205, max: 215, price: 1.03, discount: 0.24 },
    { min: 229, max: 231, price: 1.12, discount: 0.42 },
    { min: 230, max: 259, price: 1.12, discount: 0.67 },
    { min: 220, max: 230, price: 1.03, discount: 0.4 },
    { min: 150, max: 262, price: 1.03, discount: 0.75 },
    { min: 262, max: 264, price: 1.07, discount: 0.67 },
    { min: 300, max: 310, price: 1.07, discount: 0.16 },
    { min: 264, max: 315, price: 1.07, discount: 0.3 },
    { min: 315, max: 320, price: 1.07, discount: 0.22 },
    { min: 320, max: 370, price: 0.9, discount: 0.07 }
  ];

  estimate(routeDistance: number, repositionDistance: number): number {
    const routeRate = this.getKilometerRate(routeDistance);
    const repositionRate = this.getKilometerRate(repositionDistance);
    const routeSubtotal = routeDistance * routeRate.price;
    const routeTotal = Math.max(routeSubtotal - routeSubtotal * routeRate.discount, 0);
    const repositionTotal = repositionDistance * repositionRate.price;

    return this.roundMoney(routeTotal + repositionTotal);
  }

  getKilometerRate(distance: number): { price: number; discount: number } {
    const match = this.rateRules.find((rule) => distance > rule.min && distance <= rule.max || distance === 0 && rule.min === 0);
    return match ? { price: match.price, discount: match.discount } : { price: 0.9, discount: 0 };
  }

  private roundMoney(value: number): number {
    return Number(value.toFixed(2));
  }
}
