import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { environment } from '../environments/environment';
const ADMIN_API = environment.apiUrl;

import { PhoneFieldComponent } from './phone-field.component';

import {
  AdminCompany,
  AdminMessage,
  AdminPhone,
  AdminPlace,
  AdminReservation,
  AdminService,
  AdminShuttle,
  CONTACT_TYPE_OPTIONS,
  HeroImage,
  USER_ROLE_OPTIONS
} from './admin.service';
import { AuthService, AuthUser } from './auth.service';
import { BookingPolicy, CarType, Testimonial } from './models';
import { FixedRoutePrice, PriceRule, PricingConfig, ServicePricingRule } from './pricing.service';

type AdminTab = 'destinations' | 'hero' | 'testimonials' | 'pricing' | 'policy' | 'reservations' | 'company' | 'messages' | 'users';
type ModalType = 'place' | 'hero' | 'testimonial' | 'pricingRule' | 'fixedRoute' | 'serviceRule' | 'carType' | 'reservation' | 'company' | 'message' | 'user';

type AdminCompanyDraft = AdminCompany & {
  newPhoneType?: string;
  newPhoneLabel?: string;
  newPhoneCode?: string;
  newPhoneNumber?: string;
  newPhoneHref?: string;
  newPhoneSortOrder?: number;
};

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PhoneFieldComponent],
  template: `
    <section class="admin-page">
      <div class="admin-shell admin-dashboard">
        <header class="admin-header">
          <div>
            <p class="eyebrow">Maintenance</p>
            <h1>CR Travel Service Admin</h1>
            <p>Manage content, booking requests, contact data, and privileged access.</p>
          </div>
          <div class="admin-actions">
            <a routerLink="/home" class="secondary-action">View site</a>
            <button type="button" class="remove-transfer" (click)="auth.logout()">Logout</button>
          </div>
        </header>

        <nav class="admin-tabs admin-tabs-buttons" aria-label="Admin sections">
          <button type="button" [class.active]="activeTab === 'destinations'" (click)="activeTab = 'destinations'">Destinations</button>
          <button type="button" [class.active]="activeTab === 'hero'" (click)="activeTab = 'hero'">Hero images</button>
          <button type="button" [class.active]="activeTab === 'testimonials'" (click)="activeTab = 'testimonials'">Testimonials</button>
          <button type="button" [class.active]="activeTab === 'pricing'" (click)="activeTab = 'pricing'">Pricing</button>
          <button type="button" [class.active]="activeTab === 'policy'" (click)="activeTab = 'policy'; loadPolicy()">Booking policy</button>
          <button type="button" [class.active]="activeTab === 'reservations'" (click)="activeTab = 'reservations'">Reservations</button>
          <button type="button" [class.active]="activeTab === 'company'" (click)="activeTab = 'company'">Company</button>
          <button type="button" [class.active]="activeTab === 'messages'" (click)="activeTab = 'messages'">Messages</button>
          <button type="button" [class.active]="activeTab === 'users'" (click)="activeTab = 'users'" *ngIf="auth.isSuper()">Users</button>
        </nav>

        <p class="success" *ngIf="message">{{ message }}</p>
        <p class="error" *ngIf="error">{{ error }}</p>

        <section class="admin-panel" *ngIf="activeTab === 'destinations'">
          <div class="admin-panel-heading">
            <div>
              <p class="eyebrow">Destinations</p>
              <h2>Cards and route content</h2>
            </div>
          </div>

          <form class="admin-form" #placeForm="ngForm" (ngSubmit)="createPlace()">
            <div class="admin-form-row">
              <div class="admin-field admin-field-wide">
                <label for="newPlaceName">Destination name <span class="required-mark">*</span></label>
                <input id="newPlaceName" name="newPlaceName" placeholder="e.g. La Fortuna / Arenal" [(ngModel)]="newPlace.name" required>
              </div>
              <label class="admin-file-control">
                <span class="file-label">Image</span>
                <span class="file-picker-shell">
                  <span class="file-picker-button">Choose image</span>
                  <span class="file-picker-name">{{ newPlace.image ? 'Image selected' : 'No image selected' }}</span>
                </span>
                <input type="file" accept="image/*" (change)="handleImageFile($event, 'newPlace')">
              </label>
              <img class="admin-image-preview" *ngIf="newPlace.image" [src]="newPlace.image" alt="Destination preview">
            </div>
            <div class="admin-form-row">
              <div class="admin-field admin-field-full">
                <label for="newPlaceDescription">Description <span class="required-mark">*</span></label>
                <textarea id="newPlaceDescription" name="newPlaceDescription" placeholder="What makes this destination notable?" rows="3" [(ngModel)]="newPlace.description" required></textarea>
              </div>
            </div>
            <div class="admin-form-footer">
              <button type="submit" class="primary-action" [disabled]="placeForm.invalid || uploadBusy">Add destination</button>
            </div>
          </form>

          <div class="admin-table-wrap">
            <table class="admin-table">
              <thead><tr><th>Image</th><th>Name</th><th>Description</th><th>Actions</th></tr></thead>
              <tbody>
                <tr *ngFor="let place of places">
                  <td><img class="admin-thumb" *ngIf="place.image" [src]="place.image" alt=""></td>
                  <td>{{ place.name }}</td>
                  <td>{{ place.description }}</td>
                  <td class="table-actions">
                    <button type="button" class="secondary-action" (click)="openEdit('place', place)">Edit</button>
                    <button type="button" class="remove-transfer" (click)="deletePlace(place)">Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="admin-panel" *ngIf="activeTab === 'hero'">
          <div class="admin-panel-heading">
            <div>
              <p class="eyebrow">Homepage carousel</p>
              <h2>Hero images</h2>
            </div>
          </div>

          <form class="admin-form" #heroForm="ngForm" (ngSubmit)="createHeroImage()">
            <div class="admin-form-row">
              <label class="admin-file-control">
                <span class="file-label">Image</span>
                <span class="file-picker-shell">
                  <span class="file-picker-button">Choose image</span>
                  <span class="file-picker-name">{{ newHeroImage.src ? 'Image selected' : 'No image selected' }}</span>
                </span>
                <input type="file" accept="image/*" (change)="handleImageFile($event, 'newHero')">
              </label>
              <img class="admin-image-preview wide" *ngIf="newHeroImage.src" [src]="newHeroImage.src" alt="Hero preview">
            </div>
            <div class="admin-form-footer">
              <button type="submit" class="primary-action" [disabled]="!newHeroImage.src || uploadBusy">Add image</button>
            </div>
          </form>

          <div class="admin-table-wrap">
            <table class="admin-table">
              <thead><tr><th>Preview</th><th>Source</th><th>Actions</th></tr></thead>
              <tbody>
                <tr *ngFor="let image of heroImages">
                  <td><img class="admin-thumb wide" [src]="image.src" alt=""></td>
                  <td>{{ image.src }}</td>
                  <td class="table-actions">
                    <button type="button" class="secondary-action" (click)="openEdit('hero', image)">Edit</button>
                    <button type="button" class="remove-transfer" (click)="deleteHeroImage(image)">Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="admin-panel" *ngIf="activeTab === 'testimonials'">
          <div class="admin-panel-heading">
            <div>
              <p class="eyebrow">Testimonials</p>
              <h2>Traveler feedback</h2>
            </div>
          </div>

          <form class="admin-form" #testimonialForm="ngForm" (ngSubmit)="createTestimonial()">
            <div class="admin-form-row">
              <div class="admin-field">
                <label for="newTestimonialName">Traveler name <span class="required-mark">*</span></label>
                <input id="newTestimonialName" name="newTestimonialName" placeholder="e.g. Mariana G." [(ngModel)]="newTestimonial.name" required>
              </div>
              <div class="admin-field">
                <label for="newTestimonialLocation">Location <span class="required-mark">*</span></label>
                <input id="newTestimonialLocation" name="newTestimonialLocation" placeholder="e.g. New York, USA" [(ngModel)]="newTestimonial.location" required>
              </div>
              <div class="admin-field admin-field-wide">
                <label for="newTestimonialRoute">Route <span class="required-mark">*</span></label>
                <input id="newTestimonialRoute" name="newTestimonialRoute" placeholder="e.g. SJO Airport to La Fortuna" [(ngModel)]="newTestimonial.route" required>
              </div>
              <div class="admin-field admin-field-narrow">
                <label for="newTestimonialRating">Rating (1–5) <span class="required-mark">*</span></label>
                <input id="newTestimonialRating" type="number" name="newTestimonialRating" min="1" max="5" placeholder="5" [(ngModel)]="newTestimonial.rating" required>
              </div>
            </div>
            <div class="admin-form-row">
              <div class="admin-field admin-field-full">
                <label for="newTestimonialComment">What did the traveler say? <span class="required-mark">*</span></label>
                <textarea id="newTestimonialComment" name="newTestimonialComment" placeholder="In their own words..." rows="3" [(ngModel)]="newTestimonial.comment" required></textarea>
              </div>
            </div>
            <div class="admin-form-footer">
              <label class="admin-check"><input type="checkbox" name="newTestimonialActive" [(ngModel)]="newTestimonial.active"> Visible on site</label>
              <button type="submit" class="primary-action" [disabled]="testimonialForm.invalid">Add testimonial</button>
            </div>
          </form>

          <div class="admin-table-wrap">
            <table class="admin-table">
              <thead><tr><th>Name</th><th>Route</th><th>Rating</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                <tr *ngFor="let testimonial of testimonials">
                  <td>{{ testimonial.name }}<small>{{ testimonial.location }}</small></td>
                  <td>{{ testimonial.route }}</td>
                  <td>{{ testimonial.rating }}/5</td>
                  <td>{{ testimonial.active ? 'Active' : 'Hidden' }}</td>
                  <td class="table-actions">
                    <button type="button" class="secondary-action" (click)="openEdit('testimonial', testimonial)">Edit</button>
                    <button type="button" class="remove-transfer" (click)="deleteTestimonial(testimonial)">Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="admin-panel" *ngIf="activeTab === 'pricing'">
          <div class="admin-panel-heading">
            <div>
              <p class="eyebrow">Pricing rules</p>
              <h2>Route pricing control center</h2>
              <p class="admin-helper">Use fixed route prices for high-volume routes. Distance rules apply only when no fixed price exists for the selected origin and destination.</p>
            </div>
          </div>

          <div class="pricing-guidance-grid">
            <article>
              <strong>1. Fixed price wins</strong>
              <span>SJO to La Fortuna can be set as an exact amount, regardless of distance formula.</span>
            </article>
            <article>
              <strong>2. Distance rules fill gaps</strong>
              <span>For routes without a fixed price, the quote uses route km, operation km, rate, and discount.</span>
            </article>
            <article>
              <strong>3. Service notes guide humans</strong>
              <span>Use operational rules to remind admins when a quote needs review.</span>
            </article>
          </div>

          <section class="pricing-block">
            <div class="pricing-block-heading">
              <div>
                <p class="eyebrow">Fixed routes</p>
                <h3>Exact prices by route</h3>
              </div>
            </div>
            <form class="admin-form admin-create-form" #fixedRouteForm="ngForm" (ngSubmit)="createFixedRoutePrice()">
              <div class="admin-form-row">
                <div class="admin-field">
                  <label for="fixedDeparting">Departing from <span class="required-mark">*</span></label>
                  <select id="fixedDeparting" name="fixedDeparting" [(ngModel)]="newFixedRoutePrice.departingId" required>
                    <option [ngValue]="0">Select origin</option>
                    <option *ngFor="let place of places" [ngValue]="place.id">{{ place.name }}</option>
                  </select>
                </div>
                <div class="admin-field">
                  <label for="fixedDestination">Going to <span class="required-mark">*</span></label>
                  <select id="fixedDestination" name="fixedDestination" [(ngModel)]="newFixedRoutePrice.destinationId" required>
                    <option [ngValue]="0">Select destination</option>
                    <option *ngFor="let place of places" [ngValue]="place.id">{{ place.name }}</option>
                  </select>
                </div>
                <div class="admin-field admin-field-narrow">
                  <label for="fixedPrice">One-way price (USD) <span class="required-mark">*</span></label>
                  <input id="fixedPrice" type="number" min="0" step="0.01" name="fixedPrice" placeholder="0.00" [(ngModel)]="newFixedRoutePrice.price" required>
                </div>
                <div class="admin-field admin-field-narrow">
                  <label for="fixedRoundTripPrice">Round-trip price (USD)</label>
                  <input id="fixedRoundTripPrice" type="number" min="0" step="0.01" name="fixedRoundTripPrice" [placeholder]="newFixedRoutePrice.price ? (newFixedRoutePrice.price * 2 | number:'1.2-2') : '0.00'" [(ngModel)]="newFixedRoutePrice.roundTripPrice">
                </div>
                <div class="admin-field">
                  <label for="fixedLabel">Short label</label>
                  <input id="fixedLabel" name="fixedLabel" placeholder="e.g. Jaco" [(ngModel)]="newFixedRoutePrice.label">
                </div>
              </div>
              <div class="admin-form-row">
                <div class="admin-field admin-field-full">
                  <label for="fixedNotes">Service notes for this route</label>
                  <textarea id="fixedNotes" name="fixedNotes" rows="2" placeholder="Operational notes visible only to admins — parking tips, pickup points, special instructions..." [(ngModel)]="newFixedRoutePrice.notes"></textarea>
                </div>
              </div>
              <div class="admin-form-footer">
                <label class="admin-check"><input type="checkbox" name="fixedActive" [(ngModel)]="newFixedRoutePrice.active"> Active (price applies immediately)</label>
                <button type="submit" class="primary-action" [disabled]="fixedRouteForm.invalid || !newFixedRoutePrice.departingId || !newFixedRoutePrice.destinationId">Add fixed price</button>
              </div>
            </form>

            <div class="admin-table-wrap">
              <table class="admin-table">
                <thead><tr><th>Route</th><th>Price</th><th>Notes</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  <tr *ngFor="let route of fixedRoutePrices">
                    <td>{{ route.departing?.name }} to {{ route.destination?.name }}<small>{{ route.label }}</small></td>
                    <td>{{ formatCurrency(route.price) }}</td>
                    <td>{{ route.notes }}</td>
                    <td>{{ route.active ? 'Active' : 'Off' }}</td>
                    <td class="table-actions">
                      <button type="button" class="secondary-action" (click)="openEdit('fixedRoute', route)">Edit</button>
                      <button type="button" class="remove-transfer" (click)="deleteFixedRoutePrice(route)">Delete</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section class="pricing-block">
            <div class="pricing-block-heading">
              <div>
                <p class="eyebrow">Distance formula</p>
                <h3>Fallback rules by kilometer band</h3>
              </div>
            </div>
            <form class="admin-form admin-create-form" #pricingRuleForm="ngForm" (ngSubmit)="createPricingRule()">
              <div class="admin-form-row">
                <div class="admin-field admin-field-wide">
                  <label for="ruleName">Rule name <span class="required-mark">*</span></label>
                  <input id="ruleName" name="ruleName" placeholder="e.g. Mid routes (75 – 100 km)" [(ngModel)]="newPricingRule.name" required>
                </div>
                <div class="admin-field admin-field-narrow">
                  <label for="ruleOrder">Sort order <span class="required-mark">*</span></label>
                  <input id="ruleOrder" type="number" step="1" min="0" name="ruleOrder" placeholder="1" [(ngModel)]="newPricingRule.sortOrder" required>
                </div>
              </div>
              <div class="admin-form-row">
                <div class="admin-field admin-field-narrow">
                  <label for="ruleMin">Min distance (km) <span class="required-mark">*</span></label>
                  <input id="ruleMin" type="number" step="0.1" min="0" name="ruleMin" placeholder="0" [(ngModel)]="newPricingRule.minDistance" required>
                </div>
                <div class="admin-field admin-field-narrow">
                  <label for="ruleMax">Max distance (km) <span class="required-mark">*</span></label>
                  <input id="ruleMax" type="number" step="0.1" min="0" name="ruleMax" placeholder="100" [(ngModel)]="newPricingRule.maxDistance" required>
                </div>
                <div class="admin-field admin-field-narrow">
                  <label for="rulePrice">Rate per km (USD) <span class="required-mark">*</span></label>
                  <input id="rulePrice" type="number" step="0.01" min="0" name="rulePrice" placeholder="1.68" [(ngModel)]="newPricingRule.pricePerKm" required>
                </div>
                <div class="admin-field admin-field-narrow">
                  <label for="ruleDiscount">Discount factor (0 – 1)</label>
                  <input id="ruleDiscount" type="number" step="0.01" min="0" max="1" name="ruleDiscount" placeholder="0.00" [(ngModel)]="newPricingRule.discount" required>
                </div>
              </div>
              <div class="admin-form-footer">
                <label class="admin-check"><input type="checkbox" name="ruleActive" [(ngModel)]="newPricingRule.active"> Active</label>
                <button type="submit" class="primary-action" [disabled]="pricingRuleForm.invalid">Add rule</button>
              </div>
            </form>

            <div class="admin-table-wrap">
              <table class="admin-table">
                <thead><tr><th>Rule</th><th>Distance</th><th>Rate</th><th>Discount</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  <tr *ngFor="let rule of pricingRules">
                    <td>{{ rule.name }}<small>Order {{ rule.sortOrder }}</small></td>
                    <td>{{ rule.minDistance }} - {{ rule.maxDistance }} km</td>
                    <td>{{ formatCurrency(rule.pricePerKm) }}/km</td>
                    <td>{{ formatPercent(rule.discount) }}</td>
                    <td>{{ rule.active ? 'Active' : 'Off' }}</td>
                    <td class="table-actions">
                      <button type="button" class="secondary-action" (click)="openEdit('pricingRule', rule)">Edit</button>
                      <button type="button" class="remove-transfer" (click)="deletePricingRule(rule)">Delete</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section class="pricing-block">
            <div class="pricing-block-heading">
              <div>
                <p class="eyebrow">Service rules</p>
                <h3>Operational notes for quoting</h3>
              </div>
            </div>
            <form class="admin-form admin-create-form" #serviceRuleForm="ngForm" (ngSubmit)="createServicePricingRule()">
              <div class="admin-form-row">
                <div class="admin-field admin-field-wide">
                  <label for="serviceRuleTitle">Rule title <span class="required-mark">*</span></label>
                  <input id="serviceRuleTitle" name="serviceRuleTitle" placeholder="e.g. Fixed route prices always win" [(ngModel)]="newServiceRule.title" required>
                </div>
                <div class="admin-field admin-field-narrow">
                  <label for="serviceRuleOrder">Sort order <span class="required-mark">*</span></label>
                  <input id="serviceRuleOrder" type="number" min="0" name="serviceRuleOrder" placeholder="1" [(ngModel)]="newServiceRule.sortOrder" required>
                </div>
              </div>
              <div class="admin-form-row">
                <div class="admin-field admin-field-full">
                  <label for="serviceRuleDescription">What should the team know? <span class="required-mark">*</span></label>
                  <textarea id="serviceRuleDescription" name="serviceRuleDescription" rows="3" placeholder="Operational guidance visible only to admins — when to override, what to check, edge cases..." [(ngModel)]="newServiceRule.description" required></textarea>
                </div>
              </div>
              <div class="admin-form-footer">
                <label class="admin-check"><input type="checkbox" name="serviceRuleActive" [(ngModel)]="newServiceRule.active"> Active</label>
                <button type="submit" class="primary-action" [disabled]="serviceRuleForm.invalid">Add service rule</button>
              </div>
            </form>

            <div class="admin-table-wrap">
              <table class="admin-table">
                <thead><tr><th>Rule</th><th>Description</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  <tr *ngFor="let rule of serviceRules">
                    <td>{{ rule.title }}<small>Order {{ rule.sortOrder }}</small></td>
                    <td>{{ rule.description }}</td>
                    <td>{{ rule.active ? 'Active' : 'Off' }}</td>
                    <td class="table-actions">
                      <button type="button" class="secondary-action" (click)="openEdit('serviceRule', rule)">Edit</button>
                      <button type="button" class="remove-transfer" (click)="deleteServicePricingRule(rule)">Delete</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section class="pricing-block">
            <div class="pricing-block-heading">
              <div>
                <p class="eyebrow">Vehicle types</p>
                <h3>Capacity and extra-passenger charges</h3>
              </div>
            </div>
            <p class="admin-helper" style="margin:0 0 16px">Define the vehicle options customers see when booking. <strong>Capacity</strong> is the number of passengers included in the base fare. Passengers above capacity are charged the extra fee, up to the maximum allowed.</p>
            <form class="admin-form admin-create-form" #carTypeForm="ngForm" (ngSubmit)="createCarType()">
              <div class="admin-form-row">
                <div class="admin-field admin-field-wide">
                  <label for="ctName">Vehicle name <span class="required-mark">*</span></label>
                  <input id="ctName" name="ctName" placeholder="e.g. Toyota HiAce Van" [(ngModel)]="newCarType.name" required>
                </div>
                <div class="admin-field admin-field-narrow">
                  <label for="ctOrder">Sort order</label>
                  <input id="ctOrder" type="number" min="0" name="ctOrder" placeholder="1" [(ngModel)]="newCarType.sortOrder">
                </div>
              </div>
              <div class="admin-form-row">
                <div class="admin-field">
                  <label for="ctDesc">Short description</label>
                  <input id="ctDesc" name="ctDesc" placeholder="e.g. Up to 8 passengers, A/C" [(ngModel)]="newCarType.description">
                </div>
                <div class="admin-field admin-field-narrow">
                  <label for="ctCapacity">Max passengers (base) <span class="required-mark">*</span></label>
                  <input id="ctCapacity" type="number" min="1" max="30" name="ctCapacity" placeholder="4" [(ngModel)]="newCarType.capacity" required>
                </div>
                <div class="admin-field admin-field-narrow">
                  <label for="ctExtraCharge">Extra pax charge (USD)</label>
                  <input id="ctExtraCharge" type="number" min="0" step="0.01" name="ctExtraCharge" placeholder="0.00" [(ngModel)]="newCarType.extraPassengerCharge">
                </div>
                <div class="admin-field admin-field-narrow">
                  <label for="ctMaxExtra">Max extra passengers</label>
                  <input id="ctMaxExtra" type="number" min="0" max="20" name="ctMaxExtra" placeholder="0" [(ngModel)]="newCarType.maxExtraPassengers">
                </div>
              </div>
              <div class="admin-form-footer">
                <label class="admin-check"><input type="checkbox" name="ctActive" [(ngModel)]="newCarType.active"> Active (visible to customers)</label>
                <button type="submit" class="primary-action" [disabled]="carTypeForm.invalid">Add vehicle type</button>
              </div>
            </form>

            <div class="admin-table-wrap">
              <table class="admin-table">
                <thead><tr><th>Vehicle</th><th>Capacity</th><th>Extra pax charge</th><th>Max extra</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  <tr *ngFor="let ct of carTypes">
                    <td>{{ ct.name }}<small>{{ ct.description }}</small></td>
                    <td>{{ ct.capacity }} pax</td>
                    <td>{{ ct.extraPassengerCharge > 0 ? ('$' + ct.extraPassengerCharge + '/pax') : '—' }}</td>
                    <td>{{ ct.maxExtraPassengers > 0 ? ct.maxExtraPassengers : '—' }}</td>
                    <td>{{ ct.active ? 'Active' : 'Off' }}</td>
                    <td class="table-actions">
                      <button type="button" class="secondary-action" (click)="openEdit('carType', ct)">Edit</button>
                      <button type="button" class="remove-transfer" (click)="deleteCarType(ct)">Delete</button>
                    </td>
                  </tr>
                  <tr *ngIf="!carTypes.length">
                    <td colspan="6" style="color:#607086;font-style:italic">No vehicle types yet. Add one above.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </section>

        <section class="admin-panel" *ngIf="activeTab === 'policy'">
          <div class="admin-panel-heading">
            <div>
              <p class="eyebrow">Configurable rates & policies</p>
              <h2>Booking policy</h2>
              <p>Set child rates per age group and cancellation/edit rules.</p>
            </div>
          </div>
          <div *ngIf="policy" class="admin-form-grid">
            <h3 class="admin-subheading">Child rates (per shuttle, in USD)</h3>
            <label class="admin-field">
              <span>Infant rate (0–1 yrs)</span>
              <input type="number" min="0" step="0.01" [(ngModel)]="policy.infantRate">
            </label>
            <label class="admin-field">
              <span>Toddler rate (1–4 yrs)</span>
              <input type="number" min="0" step="0.01" [(ngModel)]="policy.toddlerRate">
            </label>
            <label class="admin-field">
              <span>Preschool rate (4–6 yrs)</span>
              <input type="number" min="0" step="0.01" [(ngModel)]="policy.preschoolRate">
            </label>
            <label class="admin-field">
              <span>Child rate (6–12 yrs)</span>
              <input type="number" min="0" step="0.01" [(ngModel)]="policy.childRate">
            </label>
            <h3 class="admin-subheading">Cancellation policy</h3>
            <label class="admin-field">
              <span>Min. hours before reservation to allow cancel</span>
              <input type="number" min="0" step="1" [(ngModel)]="policy.minHoursCancel">
            </label>
            <label class="admin-field">
              <span>Cancellation fee (%)</span>
              <input type="number" min="0" max="100" step="1" [(ngModel)]="policy.cancelFeePercent">
            </label>
            <h3 class="admin-subheading">Edit policy</h3>
            <label class="admin-field">
              <span>Min. hours before reservation to allow edit</span>
              <input type="number" min="0" step="1" [(ngModel)]="policy.minHoursEdit">
            </label>
            <label class="admin-field">
              <span>Edit fee (%)</span>
              <input type="number" min="0" max="100" step="1" [(ngModel)]="policy.editFeePercent">
            </label>
            <div class="admin-form-actions">
              <button type="button" class="primary-action" (click)="savePolicy()" [disabled]="policyLoading">
                {{ policyLoading ? 'Saving...' : 'Save policy' }}
              </button>
            </div>
          </div>
          <p *ngIf="!policy">Loading policy...</p>

          <div class="admin-policy-text-section" *ngIf="defaultCompanyForPolicy">
            <h3 class="admin-subheading" style="margin-top:32px;grid-column:1/-1;">Public policy page text</h3>
            <p style="color:var(--text-muted);font-size:13px;margin:0 0 12px;">This text is shown on the public <strong>/policy</strong> page. Use plain text or simple line breaks.</p>
            <textarea class="policy-text-editor" rows="12" [(ngModel)]="defaultCompanyForPolicy.cancellationPolicyText" placeholder="Write your cancellation, modification, and refund policy here..."></textarea>
            <button type="button" class="primary-action" style="margin-top:10px;" (click)="savePolicyText()" [disabled]="policyTextLoading">
              {{ policyTextLoading ? 'Saving...' : 'Save policy text' }}
            </button>
          </div>
        </section>

        <section class="admin-panel" *ngIf="activeTab === 'reservations'">
          <div class="admin-panel-heading">
            <div>
              <p class="eyebrow">Booking requests</p>
              <h2>Reservations</h2>
            </div>
            <div class="admin-panel-filters">
              <button type="button" [class.active]="reservationFilter === 'pending'" (click)="reservationFilter = 'pending'">Pending</button>
              <button type="button" [class.active]="reservationFilter === 'confirmed'" (click)="reservationFilter = 'confirmed'">Confirmed</button>
              <button type="button" [class.active]="reservationFilter === 'cancelled'" (click)="reservationFilter = 'cancelled'">Cancelled</button>
              <button type="button" [class.active]="reservationFilter === 'all'" (click)="reservationFilter = 'all'">All</button>
            </div>
          </div>

          <div class="reservation-cards">
            <article class="reservation-admin-card" *ngFor="let r of filteredReservations" [class.res-pending]="!r.status || r.status === 'pending'" [class.res-confirmed]="r.status === 'confirmed'" [class.res-cancelled]="r.status === 'cancelled'">
              <div class="res-card-header">
                <div>
                  <span class="res-status-badge" [class.badge-pending]="!r.status || r.status === 'pending'" [class.badge-confirmed]="r.status === 'confirmed'" [class.badge-cancelled]="r.status === 'cancelled'">
                    {{ r.status || 'pending' }}
                  </span>
                  <strong class="res-id">#{{ r.id }}</strong>
                  <span class="res-date">{{ r.createdAt | date:'mediumDate' }}</span>
                </div>
                <div class="res-customer">
                  <span>{{ r.user?.name }} {{ r.user?.lastName }}</span>
                  <a [href]="'mailto:' + r.user?.email">{{ r.user?.email }}</a>
                  <span *ngIf="r.user?.phone">{{ r.user?.phone }}</span>
                </div>
              </div>

              <div class="res-transfers">
                <div class="res-transfer-row" *ngFor="let s of r.shuttles">
                  <span class="res-route">{{ s.departing?.name || '?' }} → {{ s.destination?.name || '?' }}</span>
                  <span class="res-transfer-meta">{{ s.date | date:'medium' }} · {{ s.persons }} pax · <strong>\${{ s.rate | number:'1.2-2' }}</strong></span>
                </div>
              </div>

              <p class="res-message" *ngIf="r.message"><strong>Guest notes:</strong> {{ r.message }}</p>
              <p class="res-company-notes" *ngIf="r.companyNotes"><strong>Company notes:</strong> {{ r.companyNotes }}</p>

              <div class="res-card-actions" *ngIf="!r.status || r.status === 'pending'">
                <div *ngIf="confirmingId !== r.id">
                  <button type="button" class="primary-action res-confirm-btn" (click)="startConfirm(r.id)">Confirm reservation</button>
                  <button type="button" class="remove-transfer" (click)="cancelReservationAdmin(r)">Cancel</button>
                </div>
                <div class="res-confirm-panel" *ngIf="confirmingId === r.id">
                  <textarea class="res-notes-input" rows="3" placeholder="Optional note to the customer (shown in the confirmation email)..." [(ngModel)]="confirmNotes"></textarea>
                  <div class="res-confirm-btns">
                    <button type="button" class="secondary-action" (click)="confirmingId = null">Back</button>
                    <button type="button" class="primary-action" (click)="sendConfirm(r)" [disabled]="confirmLoading">{{ confirmLoading ? 'Sending...' : 'Send confirmation email' }}</button>
                  </div>
                </div>
              </div>
              <div class="res-card-actions res-card-actions-secondary" *ngIf="r.status === 'confirmed' || r.status === 'cancelled'">
                <button type="button" class="secondary-action" (click)="openEdit('reservation', r)">Edit notes</button>
                <button type="button" class="remove-transfer" (click)="deleteReservation(r)">Delete</button>
              </div>
            </article>

            <p class="empty-state-inline" *ngIf="!filteredReservations.length">No {{ reservationFilter === 'all' ? '' : reservationFilter }} reservations.</p>
          </div>
        </section>

        <section class="admin-panel" *ngIf="activeTab === 'company'">
          <div class="admin-panel-heading">
            <div>
              <p class="eyebrow">Company data</p>
              <h2>Business profile and contact methods</h2>
              <p class="admin-helper">Everything shown on the public site — logo, name, tagline, address, and contact links — comes from the company marked as default. Switch the default to reuse this site for a different brand.</p>
            </div>
          </div>

          <form class="admin-form admin-create-form" #companyForm="ngForm" (ngSubmit)="createCompany()">
            <p class="admin-form-section-label">Identity</p>
            <div class="admin-form-row">
              <div class="admin-field">
                <label for="newCompanyName">Company name <span class="required-mark">*</span></label>
                <input id="newCompanyName" name="newCompanyName" placeholder="e.g. CR Travel Service" [(ngModel)]="newCompany.name" required>
              </div>
              <div class="admin-field">
                <label for="newCompanyEmail">Reservations email <span class="required-mark">*</span></label>
                <input id="newCompanyEmail" type="email" name="newCompanyEmail" placeholder="reservations@yourcompany.com" [(ngModel)]="newCompany.email" required>
              </div>
            </div>
            <div class="admin-form-row">
              <div class="admin-field">
                <label for="newCompanyTagline">Tagline</label>
                <input id="newCompanyTagline" name="newCompanyTagline" placeholder="Short line shown under the logo" [(ngModel)]="newCompany.tagline">
              </div>
              <div class="admin-field">
                <label for="newCompanyWebsite">Website URL</label>
                <input id="newCompanyWebsite" name="newCompanyWebsite" placeholder="https://yourcompany.com" [(ngModel)]="newCompany.website">
              </div>
              <div class="admin-field">
                <label for="newCompanyAddress">Address</label>
                <input id="newCompanyAddress" name="newCompanyAddress" placeholder="Physical address shown in the footer" [(ngModel)]="newCompany.address">
              </div>
            </div>
            <div class="admin-form-row admin-form-row-logo">
              <label class="admin-file-control">
                <span class="file-label">Logo</span>
                <span class="file-picker-shell">
                  <span class="file-picker-button">Choose logo</span>
                  <span class="file-picker-name">{{ newCompany.logo ? 'Logo selected' : 'No logo selected' }}</span>
                </span>
                <input type="file" accept="image/*" (change)="handleImageFile($event, 'newCompanyLogo')">
              </label>
              <img class="admin-image-preview" *ngIf="newCompany.logo" [src]="newCompany.logo" alt="Logo preview">
            </div>

            <p class="admin-form-section-label">First contact method <span class="admin-form-section-hint">You can add more after creating the company</span></p>
            <div class="admin-form-row">
              <div class="admin-field admin-field-narrow">
                <label for="newCompanyPhoneType">Type</label>
                <select id="newCompanyPhoneType" name="newCompanyPhoneType" [(ngModel)]="newCompanyPhone.type">
                  <option *ngFor="let option of contactTypeOptions" [value]="option.value">{{ option.label }}</option>
                </select>
              </div>
              <div class="admin-field">
                <label for="newCompanyPhoneLabel">Display label</label>
                <input id="newCompanyPhoneLabel" name="newCompanyPhoneLabel" placeholder="e.g. Costa Rica office" [(ngModel)]="newCompanyPhone.label">
              </div>
              <div class="admin-field">
                <label for="newCompanyPhoneNumber">Value (number or handle)</label>
                <input id="newCompanyPhoneNumber" name="newCompanyPhoneNumber" placeholder="+506 8888 8888 or @crtravelservice" [(ngModel)]="newCompanyPhone.number">
              </div>
            </div>
            <div class="admin-form-row">
              <div class="admin-field admin-field-wide">
                <label for="newCompanyPhoneHref">Link href</label>
                <input id="newCompanyPhoneHref" name="newCompanyPhoneHref" placeholder="tel:+50683388382  /  https://wa.me/50683388382  /  mailto:res@co.com" [(ngModel)]="newCompanyPhone.href">
              </div>
            </div>

            <div class="admin-form-footer">
              <label class="admin-check"><input type="checkbox" name="newCompanyIsDefault" [(ngModel)]="newCompany.isDefault"> Set as the default company shown on the public site</label>
              <button type="submit" class="primary-action" [disabled]="companyForm.invalid">Create company</button>
            </div>
          </form>

          <div class="admin-table-wrap">
            <table class="admin-table">
              <thead><tr><th>Company</th><th>Email</th><th>Contact methods</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                <tr *ngFor="let company of companies">
                  <td>{{ company.name }}<small>{{ company.tagline }}</small></td>
                  <td>{{ company.email }}<small>{{ company.website }}</small></td>
                  <td>
                    <span class="admin-chip" *ngFor="let phone of company.phones">{{ phone.label || phone.code }}: {{ phone.number }}</span>
                  </td>
                  <td><span class="admin-badge" *ngIf="company.isDefault">Active on site</span></td>
                  <td class="table-actions">
                    <button type="button" class="secondary-action" (click)="openEdit('company', company)">Edit</button>
                    <button type="button" class="remove-transfer" (click)="deleteCompany(company)" *ngIf="!company.isDefault">Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="admin-panel" *ngIf="activeTab === 'messages'">
          <div class="admin-panel-heading">
            <div>
              <p class="eyebrow">Inbox</p>
              <h2>Contact messages</h2>
            </div>
          </div>

          <form class="admin-form" #messageForm="ngForm" (ngSubmit)="createMessage()">
            <div class="admin-form-row">
              <div class="admin-field">
                <label for="newMessageName">Sender name <span class="required-mark">*</span></label>
                <input id="newMessageName" name="newMessageName" placeholder="e.g. John Smith" [(ngModel)]="newMessage.name" required>
              </div>
              <div class="admin-field">
                <label for="newMessageEmail">Email <span class="required-mark">*</span></label>
                <input id="newMessageEmail" type="email" name="newMessageEmail" placeholder="sender@email.com" [(ngModel)]="newMessage.email" required>
              </div>
              <div class="admin-field">
                <label for="newMessagePhone">Phone</label>
                <app-phone-field name="newMessagePhone" placeholder="555 000 0000" [(ngModel)]="newMessage.phone"></app-phone-field>
              </div>
            </div>
            <div class="admin-form-row">
              <div class="admin-field admin-field-full">
                <label for="newMessageText">Message <span class="required-mark">*</span></label>
                <textarea id="newMessageText" name="newMessageText" rows="3" placeholder="Message content" [(ngModel)]="newMessage.text" required></textarea>
              </div>
            </div>
            <div class="admin-form-footer">
              <button type="submit" class="primary-action" [disabled]="messageForm.invalid">Add message</button>
            </div>
          </form>

          <div class="admin-table-wrap">
            <table class="admin-table">
              <thead><tr><th>Name</th><th>Contact</th><th>Message</th><th>Actions</th></tr></thead>
              <tbody>
                <tr *ngFor="let item of messages">
                  <td>{{ item.name }}</td>
                  <td>{{ item.email }}<small>{{ item.phone }}</small></td>
                  <td>{{ item.text }}</td>
                  <td class="table-actions">
                    <button type="button" class="secondary-action" (click)="openEdit('message', item)">Edit</button>
                    <button type="button" class="remove-transfer" (click)="deleteMessage(item)">Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="admin-panel" *ngIf="activeTab === 'users' && auth.isSuper()">
          <div class="admin-panel-heading">
            <div>
              <p class="eyebrow">Super user only</p>
              <h2>Privileged users</h2>
            </div>
          </div>

          <form class="admin-form" #userForm="ngForm" (ngSubmit)="createPrivilegedUser()">
            <div class="admin-form-row">
              <div class="admin-field">
                <label for="privName">First name <span class="required-mark">*</span></label>
                <input id="privName" name="privName" placeholder="e.g. Ana" [(ngModel)]="newUser.name" required>
              </div>
              <div class="admin-field">
                <label for="privLastName">Last name <span class="required-mark">*</span></label>
                <input id="privLastName" name="privLastName" placeholder="e.g. García" [(ngModel)]="newUser.lastName" required>
              </div>
              <div class="admin-field">
                <label for="privPhone">Phone</label>
                <app-phone-field name="privPhone" placeholder="8888 8888" [(ngModel)]="newUser.phone"></app-phone-field>
              </div>
            </div>
            <div class="admin-form-row">
              <div class="admin-field">
                <label for="privEmail">Email <span class="required-mark">*</span></label>
                <input id="privEmail" type="email" name="privEmail" placeholder="name@company.com" [(ngModel)]="newUser.email" required>
              </div>
              <div class="admin-field">
                <label for="privPassword">Temporary password <span class="required-mark">*</span></label>
                <input id="privPassword" type="password" name="privPassword" placeholder="They can change it after login" [(ngModel)]="newUser.password" required>
              </div>
              <div class="admin-field admin-field-narrow">
                <label for="privRole">Role <span class="required-mark">*</span></label>
                <select id="privRole" name="privRole" [(ngModel)]="newUser.role">
                  <option *ngFor="let option of userRoleOptions" [value]="option.value" [hidden]="option.value === 'USER'">{{ option.label }}</option>
                </select>
              </div>
            </div>
            <div class="admin-form-footer">
              <button type="submit" class="primary-action" [disabled]="userForm.invalid">Create privileged user</button>
            </div>
          </form>

          <div class="admin-table-wrap">
            <table class="admin-table">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                <tr *ngFor="let user of users">
                  <td>{{ user.name }} {{ user.lastName }}<small>{{ user.phone }}</small></td>
                  <td>{{ user.email }}</td>
                  <td>{{ user.role }}</td>
                  <td>{{ user.active ? 'Active' : 'Inactive' }}</td>
                  <td class="table-actions">
                    <button type="button" class="secondary-action" (click)="openEdit('user', user)">Edit</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </section>

    <div class="admin-modal-backdrop" *ngIf="editModal" (click)="closeEdit()">
      <section class="admin-modal" (click)="$event.stopPropagation()">
        <header class="admin-modal-header">
          <div>
            <p class="eyebrow">Edit</p>
            <h2>{{ editModal.title }}</h2>
          </div>
          <button type="button" class="modal-close" (click)="closeEdit()">X</button>
        </header>

        <form class="admin-modal-form" (ngSubmit)="saveEdit()">
          <ng-container [ngSwitch]="editModal.type">
            <ng-container *ngSwitchCase="'place'">
              <div class="admin-field">
                <label for="editPlaceName">Destination name</label>
                <input id="editPlaceName" name="editPlaceName" placeholder="Destination name" [(ngModel)]="editModal.data.name" required>
              </div>
              <div class="admin-field">
                <label for="editPlaceDescription">Description</label>
                <textarea id="editPlaceDescription" name="editPlaceDescription" rows="4" placeholder="Description" [(ngModel)]="editModal.data.description" required></textarea>
              </div>
              <label class="admin-file-control">
                <span class="file-label">Image</span>
                <span class="file-picker-shell">
                  <span class="file-picker-button">Choose image</span>
                  <span class="file-picker-name">{{ editModal.data.image ? 'Image selected' : 'No image selected' }}</span>
                </span>
                <input type="file" accept="image/*" (change)="handleImageFile($event, 'modal')">
              </label>
              <img class="admin-image-preview wide" *ngIf="editModal.data.image" [src]="editModal.data.image" alt="Destination preview">
            </ng-container>

            <ng-container *ngSwitchCase="'hero'">
              <label class="admin-file-control">
                <span class="file-label">Image</span>
                <span class="file-picker-shell">
                  <span class="file-picker-button">Choose image</span>
                  <span class="file-picker-name">{{ editModal.data.src ? 'Image selected' : 'No image selected' }}</span>
                </span>
                <input type="file" accept="image/*" (change)="handleImageFile($event, 'modal')">
              </label>
              <img class="admin-image-preview wide" *ngIf="editModal.data.src" [src]="editModal.data.src" alt="Hero preview">
            </ng-container>

            <ng-container *ngSwitchCase="'testimonial'">
              <div class="admin-field">
                <label for="editTestimonialName">Traveler name</label>
                <input id="editTestimonialName" name="editTestimonialName" placeholder="Name" [(ngModel)]="editModal.data.name" required>
              </div>
              <div class="admin-field">
                <label for="editTestimonialLocation">Location</label>
                <input id="editTestimonialLocation" name="editTestimonialLocation" placeholder="Location" [(ngModel)]="editModal.data.location" required>
              </div>
              <div class="admin-field">
                <label for="editTestimonialRoute">Route</label>
                <input id="editTestimonialRoute" name="editTestimonialRoute" placeholder="Route" [(ngModel)]="editModal.data.route" required>
              </div>
              <div class="admin-field">
                <label for="editTestimonialRating">Rating (1-5)</label>
                <input id="editTestimonialRating" type="number" min="1" max="5" name="editTestimonialRating" placeholder="Rating" [(ngModel)]="editModal.data.rating" required>
              </div>
              <div class="admin-field">
                <label for="editTestimonialComment">Comment</label>
                <textarea id="editTestimonialComment" name="editTestimonialComment" rows="4" placeholder="Comment" [(ngModel)]="editModal.data.comment" required></textarea>
              </div>
              <label class="admin-check"><input type="checkbox" name="editTestimonialActive" [(ngModel)]="editModal.data.active"> Visible on site</label>
            </ng-container>

            <ng-container *ngSwitchCase="'fixedRoute'">
              <div class="admin-form-row">
                <div class="admin-field">
                  <label for="editFixedDeparting">Departing from <span class="required-mark">*</span></label>
                  <select id="editFixedDeparting" name="editFixedDeparting" [(ngModel)]="editModal.data.departingId" required>
                    <option [ngValue]="0">Select origin</option>
                    <option *ngFor="let place of places" [ngValue]="place.id">{{ place.name }}</option>
                  </select>
                </div>
                <div class="admin-field">
                  <label for="editFixedDestination">Going to <span class="required-mark">*</span></label>
                  <select id="editFixedDestination" name="editFixedDestination" [(ngModel)]="editModal.data.destinationId" required>
                    <option [ngValue]="0">Select destination</option>
                    <option *ngFor="let place of places" [ngValue]="place.id">{{ place.name }}</option>
                  </select>
                </div>
                <div class="admin-field admin-field-narrow">
                  <label for="editFixedPrice">Price (USD) <span class="required-mark">*</span></label>
                  <input id="editFixedPrice" type="number" min="0" step="0.01" name="editFixedPrice" placeholder="0.00" [(ngModel)]="editModal.data.price" required>
                </div>
                <div class="admin-field">
                  <label for="editFixedRoundTripPrice">Round-trip price (USD)</label>
                  <input id="editFixedRoundTripPrice" type="number" min="0" step="0.01" name="editFixedRoundTripPrice" [placeholder]="editModal.data.price ? (editModal.data.price * 2 | number:'1.2-2') : '0.00'" [(ngModel)]="editModal.data.roundTripPrice">
                </div>
                <div class="admin-field">
                  <label for="editFixedLabel">Short label</label>
                  <input id="editFixedLabel" name="editFixedLabel" placeholder="e.g. Jaco" [(ngModel)]="editModal.data.label">
                </div>
              </div>
              <div class="admin-form-row">
                <div class="admin-field admin-field-full">
                  <label for="editFixedNotes">Service notes for this route</label>
                  <textarea id="editFixedNotes" name="editFixedNotes" rows="3" placeholder="Operational notes visible only to admins..." [(ngModel)]="editModal.data.notes"></textarea>
                </div>
              </div>
              <label class="admin-check"><input type="checkbox" name="editFixedActive" [(ngModel)]="editModal.data.active"> Active (price applies immediately)</label>
            </ng-container>

            <ng-container *ngSwitchCase="'pricingRule'">
              <div class="admin-field">
                <label for="editRuleName">Rule name</label>
                <input id="editRuleName" name="editRuleName" placeholder="Rule name" [(ngModel)]="editModal.data.name" required>
              </div>
              <div class="admin-modal-sublist compact-fields">
                <div class="admin-field">
                  <label for="editRuleMin">Min distance (km)</label>
                  <input id="editRuleMin" type="number" step="0.1" min="0" name="editRuleMin" placeholder="Min km" [(ngModel)]="editModal.data.minDistance" required>
                </div>
                <div class="admin-field">
                  <label for="editRuleMax">Max distance (km)</label>
                  <input id="editRuleMax" type="number" step="0.1" min="0" name="editRuleMax" placeholder="Max km" [(ngModel)]="editModal.data.maxDistance" required>
                </div>
                <div class="admin-field">
                  <label for="editRulePrice">Price per km (USD)</label>
                  <input id="editRulePrice" type="number" step="0.01" min="0" name="editRulePrice" placeholder="Price/km" [(ngModel)]="editModal.data.pricePerKm" required>
                </div>
                <div class="admin-field">
                  <label for="editRuleDiscount">Discount (0-1)</label>
                  <input id="editRuleDiscount" type="number" step="0.01" min="0" name="editRuleDiscount" placeholder="Discount" [(ngModel)]="editModal.data.discount" required>
                </div>
                <div class="admin-field">
                  <label for="editRuleOrder">Order</label>
                  <input id="editRuleOrder" type="number" step="1" min="0" name="editRuleOrder" placeholder="Order" [(ngModel)]="editModal.data.sortOrder" required>
                </div>
                <label class="admin-check"><input type="checkbox" name="editRuleActive" [(ngModel)]="editModal.data.active"> Active</label>
              </div>
            </ng-container>

            <ng-container *ngSwitchCase="'carType'">
              <div class="admin-form-row">
                <div class="admin-field">
                  <label for="editCtName">Vehicle type name</label>
                  <input id="editCtName" name="editCtName" placeholder="e.g. Toyota HiAce Van" [(ngModel)]="editModal.data.name" required>
                </div>
                <div class="admin-field">
                  <label for="editCtOrder">Display order</label>
                  <input id="editCtOrder" type="number" min="0" name="editCtOrder" placeholder="1" [(ngModel)]="editModal.data.sortOrder">
                </div>
              </div>
              <div class="admin-field">
                <label for="editCtDesc">Description</label>
                <input id="editCtDesc" name="editCtDesc" placeholder="e.g. Up to 8 passengers, A/C" [(ngModel)]="editModal.data.description">
              </div>
              <div class="admin-form-row">
                <div class="admin-field">
                  <label for="editCtCapacity">Base capacity (pax)</label>
                  <input id="editCtCapacity" type="number" min="1" max="30" name="editCtCapacity" placeholder="4" [(ngModel)]="editModal.data.capacity" required>
                </div>
                <div class="admin-field">
                  <label for="editCtExtraCharge">Extra pax charge ($)</label>
                  <input id="editCtExtraCharge" type="number" min="0" step="0.01" name="editCtExtraCharge" placeholder="0.00" [(ngModel)]="editModal.data.extraPassengerCharge">
                </div>
                <div class="admin-field">
                  <label for="editCtMaxExtra">Max extra pax</label>
                  <input id="editCtMaxExtra" type="number" min="0" max="20" name="editCtMaxExtra" placeholder="0" [(ngModel)]="editModal.data.maxExtraPassengers">
                </div>
              </div>
              <label class="admin-check"><input type="checkbox" name="editCtActive" [(ngModel)]="editModal.data.active"> Active (visible to customers)</label>
            </ng-container>

            <ng-container *ngSwitchCase="'serviceRule'">
              <div class="admin-field">
                <label for="editServiceTitle">Rule title</label>
                <input id="editServiceTitle" name="editServiceTitle" placeholder="Rule title" [(ngModel)]="editModal.data.title" required>
              </div>
              <div class="admin-field">
                <label for="editServiceOrder">Order</label>
                <input id="editServiceOrder" type="number" min="0" name="editServiceOrder" placeholder="Order" [(ngModel)]="editModal.data.sortOrder" required>
              </div>
              <div class="admin-field">
                <label for="editServiceDescription">What should the team know?</label>
                <textarea id="editServiceDescription" name="editServiceDescription" rows="4" placeholder="What should the team know?" [(ngModel)]="editModal.data.description" required></textarea>
              </div>
              <label class="admin-check"><input type="checkbox" name="editServiceActive" [(ngModel)]="editModal.data.active"> Active</label>
            </ng-container>

            <ng-container *ngSwitchCase="'reservation'">
              <div class="admin-field">
                <label for="editReservationMessage">Reservation notes</label>
                <textarea id="editReservationMessage" name="editReservationMessage" rows="4" placeholder="Reservation notes" [(ngModel)]="editModal.data.message"></textarea>
              </div>
              <div class="admin-modal-sublist" *ngFor="let shuttle of editModal.data.shuttles; let i = index">
                <div class="admin-field">
                  <label for="editShuttleDeparting{{ i }}">Departing from</label>
                  <select id="editShuttleDeparting{{ i }}" name="editShuttleDeparting{{ i }}" [(ngModel)]="shuttle.departingId">
                    <option [ngValue]="undefined">Select departing place</option>
                    <option *ngFor="let place of places" [ngValue]="place.id">{{ place.name }}</option>
                  </select>
                </div>
                <div class="admin-field">
                  <label for="editShuttleDestination{{ i }}">Going to</label>
                  <select id="editShuttleDestination{{ i }}" name="editShuttleDestination{{ i }}" [(ngModel)]="shuttle.destinationId">
                    <option [ngValue]="undefined">Select destination</option>
                    <option *ngFor="let place of places" [ngValue]="place.id">{{ place.name }}</option>
                  </select>
                </div>
                <div class="admin-field">
                  <label for="editShuttleDate{{ i }}">Date &amp; time</label>
                  <input id="editShuttleDate{{ i }}" type="datetime-local" name="editShuttleDate{{ i }}" [(ngModel)]="shuttle.date">
                </div>
                <div class="admin-field">
                  <label for="editShuttlePersons{{ i }}">Passengers</label>
                  <input id="editShuttlePersons{{ i }}" type="number" min="1" name="editShuttlePersons{{ i }}" [(ngModel)]="shuttle.persons">
                </div>
                <button type="button" class="remove-transfer" (click)="deleteShuttleFromModal(shuttle)">Delete transfer</button>
              </div>
            </ng-container>

            <ng-container *ngSwitchCase="'company'">
              <p class="admin-form-section-label">Identity</p>
              <div class="admin-form-row">
                <div class="admin-field">
                  <label for="editCompanyName">Company name <span class="required-mark">*</span></label>
                  <input id="editCompanyName" name="editCompanyName" placeholder="e.g. CR Travel Service" [(ngModel)]="editModal.data.name" required>
                </div>
                <div class="admin-field">
                  <label for="editCompanyEmail">Reservations email <span class="required-mark">*</span></label>
                  <input id="editCompanyEmail" type="email" name="editCompanyEmail" placeholder="reservations@yourcompany.com" [(ngModel)]="editModal.data.email" required>
                </div>
              </div>
              <div class="admin-form-row">
                <div class="admin-field">
                  <label for="editCompanyTagline">Tagline</label>
                  <input id="editCompanyTagline" name="editCompanyTagline" placeholder="Short line shown under the logo" [(ngModel)]="editModal.data.tagline">
                </div>
                <div class="admin-field">
                  <label for="editCompanyWebsite">Website URL</label>
                  <input id="editCompanyWebsite" name="editCompanyWebsite" placeholder="https://yourcompany.com" [(ngModel)]="editModal.data.website">
                </div>
                <div class="admin-field">
                  <label for="editCompanyAddress">Address</label>
                  <input id="editCompanyAddress" name="editCompanyAddress" placeholder="Physical address shown in the footer" [(ngModel)]="editModal.data.address">
                </div>
              </div>
              <div class="admin-form-row admin-form-row-logo">
                <label class="admin-file-control">
                  <span class="file-label">Logo</span>
                  <span class="file-picker-shell">
                    <span class="file-picker-button">Choose logo</span>
                    <span class="file-picker-name">{{ editModal.data.logo ? 'Logo selected' : 'No logo selected' }}</span>
                  </span>
                  <input type="file" accept="image/*" (change)="handleImageFile($event, 'modalCompanyLogo')">
                </label>
                <img class="admin-image-preview" *ngIf="editModal.data.logo" [src]="editModal.data.logo" alt="Logo preview">
              </div>
              <label class="admin-check"><input type="checkbox" name="editCompanyDefault" [(ngModel)]="editModal.data.isDefault"> Set as the default company shown on the public site</label>

              <p class="admin-form-section-label" style="margin-top:1.5rem">Contact methods</p>
              <div class="admin-modal-sublist" *ngFor="let phone of editModal.data.phones; let i = index">
                <div class="admin-form-row">
                  <div class="admin-field admin-field-narrow">
                    <label for="editPhoneType{{ i }}">Type</label>
                    <select id="editPhoneType{{ i }}" name="editPhoneType{{ i }}" [(ngModel)]="phone.type">
                      <option *ngFor="let option of contactTypeOptions" [value]="option.value">{{ option.label }}</option>
                    </select>
                  </div>
                  <div class="admin-field">
                    <label for="editPhoneLabel{{ i }}">Display label</label>
                    <input id="editPhoneLabel{{ i }}" name="editPhoneLabel{{ i }}" placeholder="e.g. Costa Rica office" [(ngModel)]="phone.label">
                  </div>
                  <div class="admin-field">
                    <label for="editPhoneNumber{{ i }}">Value</label>
                    <input id="editPhoneNumber{{ i }}" name="editPhoneNumber{{ i }}" placeholder="Number or handle" [(ngModel)]="phone.number">
                  </div>
                  <div class="admin-field admin-field-narrow">
                    <label for="editPhoneOrder{{ i }}">Order</label>
                    <input id="editPhoneOrder{{ i }}" type="number" name="editPhoneOrder{{ i }}" placeholder="0" [(ngModel)]="phone.sortOrder">
                  </div>
                </div>
                <div class="admin-form-row">
                  <div class="admin-field admin-field-wide">
                    <label for="editPhoneHref{{ i }}">Link href</label>
                    <input id="editPhoneHref{{ i }}" name="editPhoneHref{{ i }}" placeholder="tel:+506...  /  https://wa.me/...  /  mailto:..." [(ngModel)]="phone.href">
                  </div>
                  <div class="admin-field-inline-actions">
                    <label class="admin-check"><input type="checkbox" name="editPhoneActive{{ i }}" [(ngModel)]="phone.active"> Active</label>
                    <button type="button" class="remove-transfer" (click)="deletePhoneFromModal(phone)">Remove</button>
                  </div>
                </div>
              </div>

              <p class="admin-form-section-label" style="margin-top:1rem">Add contact method</p>
              <div class="admin-form-row">
                <div class="admin-field admin-field-narrow">
                  <label for="modalPhoneType">Type</label>
                  <select id="modalPhoneType" name="modalPhoneType" [(ngModel)]="editModal.data.newPhoneType">
                    <option *ngFor="let option of contactTypeOptions" [value]="option.value">{{ option.label }}</option>
                  </select>
                </div>
                <div class="admin-field">
                  <label for="modalPhoneLabel">Display label</label>
                  <input id="modalPhoneLabel" name="modalPhoneLabel" placeholder="e.g. WhatsApp US" [(ngModel)]="editModal.data.newPhoneLabel">
                </div>
                <div class="admin-field">
                  <label for="modalPhoneNumber">Value</label>
                  <input id="modalPhoneNumber" name="modalPhoneNumber" placeholder="Number or handle" [(ngModel)]="editModal.data.newPhoneNumber">
                </div>
                <div class="admin-field admin-field-narrow">
                  <label for="modalPhoneOrder">Order</label>
                  <input id="modalPhoneOrder" type="number" name="modalPhoneOrder" placeholder="0" [(ngModel)]="editModal.data.newPhoneSortOrder">
                </div>
              </div>
              <div class="admin-form-row">
                <div class="admin-field admin-field-wide">
                  <label for="modalPhoneHref">Link href</label>
                  <input id="modalPhoneHref" name="modalPhoneHref" placeholder="tel:+506...  /  https://wa.me/...  /  mailto:..." [(ngModel)]="editModal.data.newPhoneHref">
                </div>
                <div class="admin-field-inline-actions">
                  <button type="button" class="secondary-action" (click)="createPhoneFromModal()">Add contact</button>
                </div>
              </div>
            </ng-container>

            <ng-container *ngSwitchCase="'message'">
              <div class="admin-field">
                <label for="editMessageName">Name</label>
                <input id="editMessageName" name="editMessageName" placeholder="Name" [(ngModel)]="editModal.data.name" required>
              </div>
              <div class="admin-field">
                <label for="editMessagePhone">Phone</label>
                <app-phone-field name="editMessagePhone" placeholder="555 000 0000" [(ngModel)]="editModal.data.phone"></app-phone-field>
              </div>
              <div class="admin-field">
                <label for="editMessageEmail">Email</label>
                <input id="editMessageEmail" type="email" name="editMessageEmail" placeholder="Email" [(ngModel)]="editModal.data.email" required>
              </div>
              <div class="admin-field">
                <label for="editMessageText">Message</label>
                <textarea id="editMessageText" name="editMessageText" rows="4" placeholder="Message" [(ngModel)]="editModal.data.text" required></textarea>
              </div>
            </ng-container>

            <ng-container *ngSwitchCase="'user'">
              <div class="admin-field">
                <label for="editUserName">First name</label>
                <input id="editUserName" name="editUserName" placeholder="First name" [(ngModel)]="editModal.data.name" required>
              </div>
              <div class="admin-field">
                <label for="editUserLastName">Last name</label>
                <input id="editUserLastName" name="editUserLastName" placeholder="Last name" [(ngModel)]="editModal.data.lastName" required>
              </div>
              <div class="admin-field">
                <label for="editUserPhone">Phone</label>
                <app-phone-field name="editUserPhone" placeholder="8888 8888" [(ngModel)]="editModal.data.phone"></app-phone-field>
              </div>
              <div class="admin-field">
                <label for="editUserEmail">Email</label>
                <input id="editUserEmail" name="editUserEmail" placeholder="Email" [(ngModel)]="editModal.data.email" disabled>
              </div>
              <div class="admin-field">
                <label for="editUserRole">Role</label>
                <select id="editUserRole" name="editUserRole" [(ngModel)]="editModal.data.role">
                  <option *ngFor="let option of userRoleOptions" [value]="option.value">{{ option.label }}</option>
                </select>
              </div>
              <label class="admin-check"><input type="checkbox" name="editUserActive" [(ngModel)]="editModal.data.active"> Active</label>
            </ng-container>
          </ng-container>

          <footer class="admin-modal-actions">
            <button type="button" class="remove-transfer" (click)="closeEdit()">Cancel</button>
            <button type="submit" class="primary-action" [disabled]="uploadBusy">Save changes</button>
          </footer>
        </form>
      </section>
    </div>
  `
})
export class AdminPageComponent implements OnInit {
  activeTab: AdminTab = 'destinations';
  places: AdminPlace[] = [];
  testimonials: Testimonial[] = [];
  heroImages: HeroImage[] = [];
  reservations: AdminReservation[] = [];
  companies: AdminCompanyDraft[] = [];
  messages: AdminMessage[] = [];
  users: AuthUser[] = [];
  pricingRules: PriceRule[] = [];
  fixedRoutePrices: FixedRoutePrice[] = [];
  serviceRules: ServicePricingRule[] = [];
  carTypes: CarType[] = [];

  newPlace: AdminPlace = { name: '', description: '', image: '' };
  newHeroImage: HeroImage = { src: '' };
  newTestimonial: Testimonial = { id: 0, name: '', location: '', route: '', rating: 5, comment: '', active: true };
  newCompany: AdminCompany = this.emptyCompany();
  newCompanyPhone: AdminPhone = this.emptyCompanyPhone();
  contactTypeOptions = CONTACT_TYPE_OPTIONS;
  userRoleOptions = USER_ROLE_OPTIONS;
  newMessage: AdminMessage = { name: '', phone: '', email: '', text: '' };
  newUser = { name: '', lastName: '', phone: '', email: '', password: '', role: 'ADMIN' as 'ADMIN' | 'SUPER' };
  newFixedRoutePrice: FixedRoutePrice = this.emptyFixedRoutePrice();
  newPricingRule: PriceRule = this.emptyPricingRule();
  newServiceRule: ServicePricingRule = this.emptyServiceRule();
  newCarType: Partial<CarType> = this.emptyCarType();
  editModal: { type: ModalType; title: string; data: any } | null = null;
  uploadBusy = false;
  message = '';
  error = '';
  policy: BookingPolicy | null = null;
  policyLoading = false;
  defaultCompanyForPolicy: AdminCompany | null = null;
  policyTextLoading = false;
  reservationFilter: 'pending' | 'confirmed' | 'cancelled' | 'all' = 'pending';
  confirmingId: number | null = null;
  confirmNotes = '';
  confirmLoading = false;

  constructor(
    private readonly admin: AdminService,
    public readonly auth: AuthService,
    private readonly http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loadPlaces();
    this.loadHeroImages();
    this.loadTestimonials();
    this.loadReservations();
    this.loadCompanies();
    this.loadMessages();
    this.loadPricing();
    if (this.auth.isSuper()) {
      this.loadUsers();
    }
  }

  get filteredReservations(): AdminReservation[] {
    if (this.reservationFilter === 'all') return this.reservations;
    return this.reservations.filter((r) => (r.status || 'pending') === this.reservationFilter);
  }

  startConfirm(id: number): void {
    this.confirmingId = id;
    this.confirmNotes = '';
  }

  sendConfirm(reservation: AdminReservation): void {
    this.confirmLoading = true;
    this.admin.confirmReservation(reservation.id, this.confirmNotes).subscribe({
      next: (updated) => {
        const idx = this.reservations.findIndex((r) => r.id === reservation.id);
        if (idx !== -1) this.reservations[idx] = updated;
        this.confirmingId = null;
        this.confirmLoading = false;
        this.message = `Reservation #${reservation.id} confirmed — confirmation email sent.`;
      },
      error: (err) => {
        this.confirmLoading = false;
        this.error = err.error?.message || 'Could not confirm reservation.';
      }
    });
  }

  cancelReservationAdmin(reservation: AdminReservation): void {
    this.admin.updateReservation({ id: reservation.id, message: reservation.message, companyNotes: reservation.companyNotes, status: 'cancelled' }).subscribe({
      next: (updated) => {
        const idx = this.reservations.findIndex((r) => r.id === reservation.id);
        if (idx !== -1) this.reservations[idx] = updated;
      },
      error: (err) => this.error = err.error?.message || 'Could not cancel reservation.'
    });
  }

  loadPolicy(): void {
    if (this.policy) return;
    this.http.get<BookingPolicy>(`${ADMIN_API}/admin/booking-policy`, this.auth.authOptions()).subscribe({
      next: (p) => this.policy = { ...p },
      error: () => this.error = 'Could not load booking policy.'
    });
    if (!this.defaultCompanyForPolicy) {
      this.http.get<AdminCompany>(`${ADMIN_API}/company`).subscribe({
        next: (c) => this.defaultCompanyForPolicy = { ...c },
        error: () => {}
      });
    }
  }

  savePolicyText(): void {
    if (!this.defaultCompanyForPolicy || !this.defaultCompanyForPolicy.id) return;
    this.policyTextLoading = true;
    this.admin.updateCompany(this.defaultCompanyForPolicy).subscribe({
      next: (c) => {
        this.defaultCompanyForPolicy = { ...c };
        this.policyTextLoading = false;
        this.message = 'Policy text saved.';
      },
      error: () => {
        this.policyTextLoading = false;
        this.error = 'Could not save policy text.';
      }
    });
  }

  savePolicy(): void {
    if (!this.policy) return;
    this.policyLoading = true;
    this.http.put<BookingPolicy>(`${ADMIN_API}/admin/booking-policy`, this.policy, this.auth.authOptions()).subscribe({
      next: (p) => {
        this.policy = { ...p };
        this.policyLoading = false;
        this.message = 'Booking policy saved.';
      },
      error: () => {
        this.policyLoading = false;
        this.error = 'Could not save booking policy.';
      }
    });
  }

  openEdit(type: ModalType, item: any): void {
    const data = JSON.parse(JSON.stringify(item));
    if (type === 'place') {
      data.image = item.image || item.images?.[0]?.src || '';
    }
    if (type === 'company') {
      data.newPhoneType = 'phone';
      data.newPhoneLabel = '';
      data.newPhoneCode = '';
      data.newPhoneNumber = '';
      data.newPhoneHref = '';
      data.newPhoneSortOrder = (data.phones || []).length + 1;
    }
    this.editModal = { type, title: this.modalTitle(type, item), data };
  }

  closeEdit(): void {
    this.editModal = null;
  }

  saveEdit(): void {
    if (!this.editModal) {
      return;
    }

    const data = this.editModal.data;
    switch (this.editModal.type) {
      case 'place':
        this.updatePlace(data);
        break;
      case 'hero':
        this.updateHeroImage(data);
        break;
      case 'testimonial':
        this.updateTestimonial(data);
        break;
      case 'fixedRoute':
        this.updateFixedRoutePrice(data);
        break;
      case 'pricingRule':
        this.updatePricingRule(data);
        break;
      case 'serviceRule':
        this.updateServicePricingRule(data);
        break;
      case 'carType':
        this.updateCarType(data);
        break;
      case 'reservation':
        this.saveReservationModal(data);
        break;
      case 'company':
        this.saveCompanyModal(data);
        break;
      case 'message':
        this.updateMessage(data);
        break;
      case 'user':
        this.updateUser(data);
        break;
    }
    this.closeEdit();
  }

  handleImageFile(event: Event, target: 'newPlace' | 'newHero' | 'newCompanyLogo' | 'modal' | 'modalCompanyLogo'): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      this.setImageTarget(target, dataUrl);
      this.uploadBusy = true;
      this.admin.uploadImage({ dataUrl, fileName: file.name }).subscribe({
        next: ({ src }) => {
          this.setImageTarget(target, src);
          this.uploadBusy = false;
          this.error = '';
        },
        error: (error) => {
          this.uploadBusy = false;
          this.fail(error);
        }
      });
    };
    reader.readAsDataURL(file);
  }

  createPlace(): void {
    this.admin.createPlace(this.newPlace).subscribe({
      next: () => {
        this.newPlace = { name: '', description: '', image: '' };
        this.done('Destination created.');
        this.loadPlaces();
      },
      error: (error) => this.fail(error)
    });
  }

  updatePlace(place: AdminPlace): void {
    this.admin.updatePlace(place).subscribe({
      next: () => {
        this.done('Destination updated.');
        this.loadPlaces();
      },
      error: (error) => this.fail(error)
    });
  }

  deletePlace(place: AdminPlace): void {
    if (!place.id) {
      return;
    }

    this.admin.deletePlace(place.id).subscribe({
      next: () => {
        this.done('Destination deleted.');
        this.loadPlaces();
      },
      error: (error) => this.fail(error)
    });
  }

  createHeroImage(): void {
    this.admin.createHeroImage(this.newHeroImage).subscribe({
      next: () => {
        this.newHeroImage = { src: '' };
        this.done('Hero image created.');
        this.loadHeroImages();
      },
      error: (error) => this.fail(error)
    });
  }

  updateHeroImage(image: HeroImage): void {
    this.admin.updateHeroImage(image).subscribe({
      next: () => {
        this.done('Hero image updated.');
        this.loadHeroImages();
      },
      error: (error) => this.fail(error)
    });
  }

  deleteHeroImage(image: HeroImage): void {
    if (!image.id) {
      return;
    }

    this.admin.deleteHeroImage(image.id).subscribe({
      next: () => {
        this.done('Hero image deleted.');
        this.loadHeroImages();
      },
      error: (error) => this.fail(error)
    });
  }

  createTestimonial(): void {
    this.admin.createTestimonial(this.newTestimonial).subscribe({
      next: () => {
        this.newTestimonial = { id: 0, name: '', location: '', route: '', rating: 5, comment: '', active: true };
        this.done('Testimonial created.');
        this.loadTestimonials();
      },
      error: (error) => this.fail(error)
    });
  }

  updateTestimonial(testimonial: Testimonial): void {
    this.admin.updateTestimonial(testimonial).subscribe({
      next: () => {
        this.done('Testimonial updated.');
        this.loadTestimonials();
      },
      error: (error) => this.fail(error)
    });
  }

  deleteTestimonial(testimonial: Testimonial): void {
    this.admin.deleteTestimonial(testimonial.id).subscribe({
      next: () => {
        this.done('Testimonial deleted.');
        this.loadTestimonials();
      },
      error: (error) => this.fail(error)
    });
  }

  createFixedRoutePrice(): void {
    if (this.newFixedRoutePrice.departingId === this.newFixedRoutePrice.destinationId) {
      this.error = 'Departing and destination must be different.';
      this.message = '';
      return;
    }

    this.admin.createFixedRoutePrice(this.normalizeFixedRoute(this.newFixedRoutePrice)).subscribe({
      next: () => {
        this.newFixedRoutePrice = this.emptyFixedRoutePrice();
        this.done('Fixed route price created.');
        this.loadPricing();
      },
      error: (error) => this.fail(error)
    });
  }

  updateFixedRoutePrice(route: FixedRoutePrice): void {
    this.admin.updateFixedRoutePrice(this.normalizeFixedRoute(route)).subscribe({
      next: () => {
        this.done('Fixed route price updated.');
        this.loadPricing();
      },
      error: (error) => this.fail(error)
    });
  }

  deleteFixedRoutePrice(route: FixedRoutePrice): void {
    if (!route.id) {
      return;
    }

    this.admin.deleteFixedRoutePrice(route.id).subscribe({
      next: () => {
        this.done('Fixed route price deleted.');
        this.loadPricing();
      },
      error: (error) => this.fail(error)
    });
  }

  createPricingRule(): void {
    this.admin.createPricingRule(this.normalizePricingRule(this.newPricingRule)).subscribe({
      next: () => {
        this.newPricingRule = this.emptyPricingRule();
        this.done('Pricing rule created.');
        this.loadPricing();
      },
      error: (error) => this.fail(error)
    });
  }

  updatePricingRule(rule: PriceRule): void {
    this.admin.updatePricingRule(this.normalizePricingRule(rule)).subscribe({
      next: () => {
        this.done('Pricing rule updated.');
        this.loadPricing();
      },
      error: (error) => this.fail(error)
    });
  }

  deletePricingRule(rule: PriceRule): void {
    if (!rule.id) {
      return;
    }

    this.admin.deletePricingRule(rule.id).subscribe({
      next: () => {
        this.done('Pricing rule deleted.');
        this.loadPricing();
      },
      error: (error) => this.fail(error)
    });
  }

  createServicePricingRule(): void {
    this.admin.createServicePricingRule(this.normalizeServiceRule(this.newServiceRule)).subscribe({
      next: () => {
        this.newServiceRule = this.emptyServiceRule();
        this.done('Service pricing rule created.');
        this.loadPricing();
      },
      error: (error) => this.fail(error)
    });
  }

  updateServicePricingRule(rule: ServicePricingRule): void {
    this.admin.updateServicePricingRule(this.normalizeServiceRule(rule)).subscribe({
      next: () => {
        this.done('Service pricing rule updated.');
        this.loadPricing();
      },
      error: (error) => this.fail(error)
    });
  }

  deleteServicePricingRule(rule: ServicePricingRule): void {
    if (!rule.id) {
      return;
    }

    this.admin.deleteServicePricingRule(rule.id).subscribe({
      next: () => {
        this.done('Service pricing rule deleted.');
        this.loadPricing();
      },
      error: (error) => this.fail(error)
    });
  }

  updateReservation(reservation: AdminReservation): void {
    this.admin.updateReservation(reservation).subscribe({
      next: () => {
        this.done('Reservation updated.');
        this.loadReservations();
      },
      error: (error) => this.fail(error)
    });
  }

  deleteReservation(reservation: AdminReservation): void {
    this.admin.deleteReservation(reservation.id).subscribe({
      next: () => {
        this.done('Reservation deleted.');
        this.loadReservations();
      },
      error: (error) => this.fail(error)
    });
  }

  updateShuttle(shuttle: AdminShuttle): void {
    if (!shuttle.id || !shuttle.departingId || !shuttle.destinationId) {
      this.error = 'Transfer must have departing and destination places.';
      this.message = '';
      return;
    }

    this.admin.updateShuttle({ ...shuttle, persons: Number(shuttle.persons) }).subscribe({
      next: () => {
        this.done('Transfer updated.');
        this.loadReservations();
      },
      error: (error) => this.fail(error)
    });
  }

  deleteShuttleFromModal(shuttle: AdminShuttle): void {
    this.deleteShuttle(shuttle);
    if (this.editModal?.type === 'reservation') {
      this.editModal.data.shuttles = this.editModal.data.shuttles.filter((item: AdminShuttle) => item.id !== shuttle.id);
    }
  }

  deleteShuttle(shuttle: AdminShuttle): void {
    if (!shuttle.id) {
      return;
    }

    this.admin.deleteShuttle(shuttle.id).subscribe({
      next: () => {
        this.done('Transfer deleted.');
        this.loadReservations();
      },
      error: (error) => this.fail(error)
    });
  }

  createCompany(): void {
    const phones = this.newCompanyPhone.number ? [{ ...this.newCompanyPhone }] : [];

    this.admin.createCompany({ ...this.newCompany, phones }).subscribe({
      next: () => {
        this.newCompany = this.emptyCompany();
        this.newCompanyPhone = this.emptyCompanyPhone();
        this.done('Company created.');
        this.loadCompanies();
      },
      error: (error) => this.fail(error)
    });
  }

  private emptyCompany(): AdminCompany {
    return { name: '', email: '', tagline: '', address: '', website: '', logo: '', isDefault: !this.companies.length };
  }

  private emptyCompanyPhone(): AdminPhone {
    return { type: 'phone', label: '', code: '', number: '', href: '', active: true, sortOrder: 1 };
  }

  updateCompany(company: AdminCompanyDraft): void {
    this.admin.updateCompany(company).subscribe({
      next: () => {
        this.done('Company updated.');
        this.loadCompanies();
      },
      error: (error) => this.fail(error)
    });
  }

  deleteCompany(company: AdminCompanyDraft): void {
    if (!company.id) {
      return;
    }

    this.admin.deleteCompany(company.id).subscribe({
      next: () => {
        this.done('Company deleted.');
        this.loadCompanies();
      },
      error: (error) => this.fail(error)
    });
  }

  createPhone(company: AdminCompanyDraft): void {
    if (!company.id || !company.newPhoneNumber) {
      this.error = 'Contact value is required.';
      this.message = '';
      return;
    }

    this.admin.createPhone({
      type: company.newPhoneType || 'phone',
      label: company.newPhoneLabel || company.newPhoneCode || '',
      code: company.newPhoneLabel || company.newPhoneCode || '',
      number: company.newPhoneNumber,
      href: company.newPhoneHref || '',
      active: true,
      sortOrder: Number(company.newPhoneSortOrder || 0),
      companyId: company.id
    }).subscribe({
      next: () => {
        company.newPhoneType = 'phone';
        company.newPhoneLabel = '';
        company.newPhoneCode = '';
        company.newPhoneNumber = '';
        company.newPhoneHref = '';
        company.newPhoneSortOrder = (company.phones || []).length + 1;
        this.done('Contact created.');
        this.loadCompanies();
      },
      error: (error) => this.fail(error)
    });
  }

  createPhoneFromModal(): void {
    if (this.editModal?.type !== 'company') {
      return;
    }
    this.createPhone(this.editModal.data);
  }

  updatePhone(phone: AdminPhone, company: AdminCompanyDraft): void {
    if (!phone.id) {
      return;
    }

    this.admin.updatePhone({ ...phone, companyId: company.id }).subscribe({
      next: () => {
        this.done('Contact updated.');
        this.loadCompanies();
      },
      error: (error) => this.fail(error)
    });
  }

  deletePhoneFromModal(phone: AdminPhone): void {
    this.deletePhone(phone);
    if (this.editModal?.type === 'company') {
      this.editModal.data.phones = this.editModal.data.phones.filter((item: AdminPhone) => item.id !== phone.id);
    }
  }

  deletePhone(phone: AdminPhone): void {
    if (!phone.id) {
      return;
    }

    this.admin.deletePhone(phone.id).subscribe({
      next: () => {
        this.done('Contact deleted.');
        this.loadCompanies();
      },
      error: (error) => this.fail(error)
    });
  }

  createMessage(): void {
    this.admin.createMessage(this.newMessage).subscribe({
      next: () => {
        this.newMessage = { name: '', phone: '', email: '', text: '' };
        this.done('Message created.');
        this.loadMessages();
      },
      error: (error) => this.fail(error)
    });
  }

  updateMessage(message: AdminMessage): void {
    this.admin.updateMessage(message).subscribe({
      next: () => {
        this.done('Message updated.');
        this.loadMessages();
      },
      error: (error) => this.fail(error)
    });
  }

  deleteMessage(message: AdminMessage): void {
    if (!message.id) {
      return;
    }

    this.admin.deleteMessage(message.id).subscribe({
      next: () => {
        this.done('Message deleted.');
        this.loadMessages();
      },
      error: (error) => this.fail(error)
    });
  }

  createPrivilegedUser(): void {
    this.admin.createPrivilegedUser(this.newUser).subscribe({
      next: () => {
        this.newUser = { name: '', lastName: '', phone: '', email: '', password: '', role: 'ADMIN' };
        this.done('Privileged user created.');
        this.loadUsers();
      },
      error: (error) => this.fail(error)
    });
  }

  updateUser(user: AuthUser): void {
    this.admin.updateUser(user).subscribe({
      next: () => {
        this.done('User updated.');
        this.loadUsers();
      },
      error: (error) => this.fail(error)
    });
  }

  private saveReservationModal(reservation: AdminReservation): void {
    this.admin.updateReservation(reservation).subscribe({
      next: () => {
        reservation.shuttles.forEach((shuttle) => this.updateShuttle(shuttle));
        this.done('Reservation updated.');
        this.loadReservations();
      },
      error: (error) => this.fail(error)
    });
  }

  private saveCompanyModal(company: AdminCompanyDraft): void {
    this.admin.updateCompany(company).subscribe({
      next: () => {
        (company.phones || []).forEach((phone) => this.updatePhone(phone, company));
        this.done('Company updated.');
        this.loadCompanies();
      },
      error: (error) => this.fail(error)
    });
  }

  private setImageTarget(target: 'newPlace' | 'newHero' | 'newCompanyLogo' | 'modal' | 'modalCompanyLogo', src: string): void {
    if (target === 'newPlace') {
      this.newPlace.image = src;
    } else if (target === 'newHero') {
      this.newHeroImage.src = src;
    } else if (target === 'newCompanyLogo') {
      this.newCompany.logo = src;
    } else if (target === 'modalCompanyLogo' && this.editModal?.type === 'company') {
      this.editModal.data.logo = src;
    } else if (this.editModal?.type === 'place') {
      this.editModal.data.image = src;
    } else if (this.editModal?.type === 'hero') {
      this.editModal.data.src = src;
    }
  }

  private loadPlaces(): void {
    this.admin.getPlaces().subscribe({
      next: (places) => this.places = places.map((place) => ({ ...place, image: place.images?.[0]?.src || place.image || '' })),
      error: (error) => this.fail(error)
    });
  }

  private loadHeroImages(): void {
    this.admin.getHeroImages().subscribe({
      next: (images) => this.heroImages = images,
      error: (error) => this.fail(error)
    });
  }

  private loadTestimonials(): void {
    this.admin.getTestimonials().subscribe({
      next: (testimonials) => this.testimonials = testimonials,
      error: (error) => this.fail(error)
    });
  }

  private loadPricing(): void {
    this.admin.getPricingConfig().subscribe({
      next: (config) => {
        this.pricingRules = config.pricingRules || [];
        this.fixedRoutePrices = config.fixedRoutePrices || [];
        this.serviceRules = config.serviceRules || [];
        this.carTypes = config.carTypes || [];
      },
      error: (error) => this.fail(error)
    });
  }

  private loadReservations(): void {
    this.admin.getReservations().subscribe({
      next: (reservations) => this.reservations = reservations.map((reservation) => ({
        ...reservation,
        shuttles: (reservation.shuttles || []).map((shuttle) => ({
          ...shuttle,
          date: this.toDateInput(shuttle.date),
          departingId: shuttle.departingId || shuttle.departing?.id,
          destinationId: shuttle.destinationId || shuttle.destination?.id
        }))
      })),
      error: (error) => this.fail(error)
    });
  }

  private loadCompanies(): void {
    this.admin.getCompanies().subscribe({
      next: (companies) => this.companies = companies.map((company) => ({
        ...company,
        newPhoneType: 'phone',
        newPhoneLabel: '',
        newPhoneCode: '',
        newPhoneNumber: '',
        newPhoneHref: '',
        newPhoneSortOrder: (company.phones || []).length + 1
      })),
      error: (error) => this.fail(error)
    });
  }

  private loadMessages(): void {
    this.admin.getMessages().subscribe({
      next: (messages) => this.messages = messages,
      error: (error) => this.fail(error)
    });
  }

  private loadUsers(): void {
    this.admin.getUsers().subscribe({
      next: (users) => this.users = users,
      error: (error) => this.fail(error)
    });
  }

  private toDateInput(value: string): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  }

  private modalTitle(type: ModalType, item: any): string {
    if (type === 'reservation') {
      return `Reservation #${item.id}`;
    }
    if (type === 'fixedRoute') {
      return item.label || `${item.departing?.name || 'Route'} to ${item.destination?.name || 'destination'}`;
    }
    if (type === 'pricingRule') {
      return item.name || 'Pricing rule';
    }
    if (type === 'serviceRule') {
      return item.title || 'Service rule';
    }
    return item.name || item.src || item.email || type;
  }

  formatCurrency(value: number): string {
    return `$${Number(value || 0).toFixed(2)}`;
  }

  formatPercent(value: number): string {
    return `${(Number(value || 0) * 100).toFixed(0)}%`;
  }

  private emptyFixedRoutePrice(): FixedRoutePrice {
    return { departingId: 0, destinationId: 0, price: 0, roundTripPrice: null, label: '', notes: '', active: true };
  }

  private emptyPricingRule(): PriceRule {
    const nextOrder = this.pricingRules.length ? Math.max(...this.pricingRules.map((rule) => Number(rule.sortOrder) || 0)) + 1 : 1;
    return { name: '', minDistance: 0, maxDistance: 0, pricePerKm: 0, discount: 0, active: true, sortOrder: nextOrder };
  }

  private emptyServiceRule(): ServicePricingRule {
    const nextOrder = this.serviceRules.length ? Math.max(...this.serviceRules.map((rule) => Number(rule.sortOrder) || 0)) + 1 : 1;
    return { title: '', description: '', active: true, sortOrder: nextOrder };
  }

  private normalizeFixedRoute(route: FixedRoutePrice): FixedRoutePrice {
    return {
      ...route,
      departingId: Number(route.departingId),
      destinationId: Number(route.destinationId),
      price: Number(route.price || 0),
      roundTripPrice: route.roundTripPrice != null ? Number(route.roundTripPrice) : null,
      label: route.label || '',
      notes: route.notes || '',
      active: Boolean(route.active)
    };
  }

  private normalizePricingRule(rule: PriceRule): PriceRule {
    return {
      ...rule,
      minDistance: Number(rule.minDistance || 0),
      maxDistance: Number(rule.maxDistance || 0),
      pricePerKm: Number(rule.pricePerKm || 0),
      discount: Number(rule.discount || 0),
      sortOrder: Number(rule.sortOrder || 0),
      active: Boolean(rule.active)
    };
  }

  private emptyCarType(): Partial<CarType> {
    const nextOrder = this.carTypes.length ? Math.max(...this.carTypes.map((ct) => Number(ct.sortOrder) || 0)) + 1 : 1;
    return { name: '', description: '', capacity: 4, extraPassengerCharge: 0, maxExtraPassengers: 0, active: true, sortOrder: nextOrder };
  }

  createCarType(): void {
    const ct = { ...this.newCarType, capacity: Number(this.newCarType.capacity || 4), extraPassengerCharge: Number(this.newCarType.extraPassengerCharge || 0), maxExtraPassengers: Number(this.newCarType.maxExtraPassengers || 0), sortOrder: Number(this.newCarType.sortOrder || 0), active: Boolean(this.newCarType.active) };
    this.admin.createCarType(ct).subscribe({
      next: () => { this.newCarType = this.emptyCarType(); this.loadPricing(); this.done('Vehicle type created.'); },
      error: (e) => this.fail(e)
    });
  }

  updateCarType(ct: CarType): void {
    const payload = { ...ct, capacity: Number(ct.capacity), extraPassengerCharge: Number(ct.extraPassengerCharge), maxExtraPassengers: Number(ct.maxExtraPassengers), sortOrder: Number(ct.sortOrder), active: Boolean(ct.active) };
    this.admin.updateCarType(payload).subscribe({
      next: () => { this.loadPricing(); this.done('Vehicle type updated.'); },
      error: (e) => this.fail(e)
    });
  }

  deleteCarType(ct: CarType): void {
    if (!confirm(`Delete vehicle type "${ct.name}"?`)) return;
    this.admin.deleteCarType(ct.id).subscribe({
      next: () => { this.loadPricing(); this.done('Vehicle type deleted.'); },
      error: (e) => this.fail(e)
    });
  }

  private normalizeServiceRule(rule: ServicePricingRule): ServicePricingRule {
    return {
      ...rule,
      title: rule.title || '',
      description: rule.description || '',
      sortOrder: Number(rule.sortOrder || 0),
      active: Boolean(rule.active)
    };
  }

  private done(message: string): void {
    this.message = message;
    this.error = '';
  }

  private fail(error: any): void {
    this.error = error.error?.message || 'Maintenance action failed.';
    this.message = '';
  }
}
