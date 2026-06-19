import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  AdminCompany,
  AdminMessage,
  AdminPhone,
  AdminPlace,
  AdminReservation,
  AdminService,
  AdminShuttle,
  HeroImage
} from './admin.service';
import { AuthService, AuthUser } from './auth.service';
import { Testimonial } from './models';
import { FixedRoutePrice, PriceRule, ServicePricingRule } from './pricing.service';

type AdminTab = 'destinations' | 'hero' | 'testimonials' | 'pricing' | 'reservations' | 'company' | 'messages' | 'users';
type ModalType = 'place' | 'hero' | 'testimonial' | 'pricingRule' | 'fixedRoute' | 'serviceRule' | 'reservation' | 'company' | 'message' | 'user';

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
  imports: [CommonModule, FormsModule, RouterLink],
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

          <form class="admin-form admin-create-form destination-create-form" #placeForm="ngForm" (ngSubmit)="createPlace()">
            <input name="newPlaceName" placeholder="Destination name" [(ngModel)]="newPlace.name" required>
            <label class="admin-file-control">
              <span class="file-label">Image</span>
              <span class="file-picker-shell">
                <span class="file-picker-button">Choose image</span>
                <span class="file-picker-name">{{ newPlace.image ? 'Image selected' : 'No image selected' }}</span>
              </span>
              <input type="file" accept="image/*" (change)="handleImageFile($event, 'newPlace')">
            </label>
            <img class="admin-image-preview" *ngIf="newPlace.image" [src]="newPlace.image" alt="Destination preview">
            <button type="submit" class="primary-action" [disabled]="placeForm.invalid || uploadBusy">Add destination</button>
            <textarea class="destination-description-field" name="newPlaceDescription" placeholder="Description" rows="2" [(ngModel)]="newPlace.description" required></textarea>
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

          <form class="admin-form admin-create-form compact-upload hero-create-form" #heroForm="ngForm" (ngSubmit)="createHeroImage()">
            <label class="admin-file-control">
              <span class="file-label">Image</span>
              <span class="file-picker-shell">
                <span class="file-picker-button">Choose image</span>
                <span class="file-picker-name">{{ newHeroImage.src ? 'Image selected' : 'No image selected' }}</span>
              </span>
              <input type="file" accept="image/*" (change)="handleImageFile($event, 'newHero')">
            </label>
            <img class="admin-image-preview wide" *ngIf="newHeroImage.src" [src]="newHeroImage.src" alt="Hero preview">
            <button type="submit" class="primary-action" [disabled]="!newHeroImage.src || uploadBusy">Add image</button>
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

          <form class="admin-form admin-create-form" #testimonialForm="ngForm" (ngSubmit)="createTestimonial()">
            <input name="newTestimonialName" placeholder="Name" [(ngModel)]="newTestimonial.name" required>
            <input name="newTestimonialLocation" placeholder="Location" [(ngModel)]="newTestimonial.location" required>
            <input name="newTestimonialRoute" placeholder="Route" [(ngModel)]="newTestimonial.route" required>
            <input type="number" name="newTestimonialRating" min="1" max="5" placeholder="Rating" [(ngModel)]="newTestimonial.rating" required>
            <textarea name="newTestimonialComment" placeholder="Comment" rows="2" [(ngModel)]="newTestimonial.comment" required></textarea>
            <label class="admin-check"><input type="checkbox" name="newTestimonialActive" [(ngModel)]="newTestimonial.active"> Active</label>
            <button type="submit" class="primary-action" [disabled]="testimonialForm.invalid">Add testimonial</button>
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
            <form class="admin-form admin-create-form pricing-create-form" #fixedRouteForm="ngForm" (ngSubmit)="createFixedRoutePrice()">
              <select name="fixedDeparting" [(ngModel)]="newFixedRoutePrice.departingId" required>
                <option [ngValue]="0">Departing</option>
                <option *ngFor="let place of places" [ngValue]="place.id">{{ place.name }}</option>
              </select>
              <select name="fixedDestination" [(ngModel)]="newFixedRoutePrice.destinationId" required>
                <option [ngValue]="0">Going to</option>
                <option *ngFor="let place of places" [ngValue]="place.id">{{ place.name }}</option>
              </select>
              <input type="number" min="0" step="0.01" name="fixedPrice" placeholder="Fixed price" [(ngModel)]="newFixedRoutePrice.price" required>
              <input name="fixedLabel" placeholder="Label, e.g. SJO to Arenal" [(ngModel)]="newFixedRoutePrice.label">
              <textarea name="fixedNotes" rows="2" placeholder="Specific service notes for this route" [(ngModel)]="newFixedRoutePrice.notes"></textarea>
              <label class="admin-check"><input type="checkbox" name="fixedActive" [(ngModel)]="newFixedRoutePrice.active"> Active</label>
              <button type="submit" class="primary-action" [disabled]="fixedRouteForm.invalid || !newFixedRoutePrice.departingId || !newFixedRoutePrice.destinationId">Add fixed price</button>
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
            <form class="admin-form admin-create-form pricing-rule-form" #pricingRuleForm="ngForm" (ngSubmit)="createPricingRule()">
              <input name="ruleName" placeholder="Rule name" [(ngModel)]="newPricingRule.name" required>
              <input type="number" step="0.1" min="0" name="ruleMin" placeholder="Min km" [(ngModel)]="newPricingRule.minDistance" required>
              <input type="number" step="0.1" min="0" name="ruleMax" placeholder="Max km" [(ngModel)]="newPricingRule.maxDistance" required>
              <input type="number" step="0.01" min="0" name="rulePrice" placeholder="Price/km" [(ngModel)]="newPricingRule.pricePerKm" required>
              <input type="number" step="0.01" min="0" name="ruleDiscount" placeholder="Discount" [(ngModel)]="newPricingRule.discount" required>
              <input type="number" step="1" min="0" name="ruleOrder" placeholder="Order" [(ngModel)]="newPricingRule.sortOrder" required>
              <label class="admin-check"><input type="checkbox" name="ruleActive" [(ngModel)]="newPricingRule.active"> Active</label>
              <button type="submit" class="primary-action" [disabled]="pricingRuleForm.invalid">Add rule</button>
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
            <form class="admin-form admin-create-form service-rule-form" #serviceRuleForm="ngForm" (ngSubmit)="createServicePricingRule()">
              <input name="serviceRuleTitle" placeholder="Rule title" [(ngModel)]="newServiceRule.title" required>
              <input type="number" min="0" name="serviceRuleOrder" placeholder="Order" [(ngModel)]="newServiceRule.sortOrder" required>
              <label class="admin-check"><input type="checkbox" name="serviceRuleActive" [(ngModel)]="newServiceRule.active"> Active</label>
              <textarea name="serviceRuleDescription" rows="2" placeholder="What should the team know?" [(ngModel)]="newServiceRule.description" required></textarea>
              <button type="submit" class="primary-action" [disabled]="serviceRuleForm.invalid">Add service rule</button>
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
        </section>

        <section class="admin-panel" *ngIf="activeTab === 'reservations'">
          <div class="admin-panel-heading">
            <div>
              <p class="eyebrow">Booking requests</p>
              <h2>Reservations</h2>
            </div>
          </div>

          <div class="admin-table-wrap">
            <table class="admin-table">
              <thead><tr><th>ID</th><th>Customer</th><th>Transfers</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                <tr *ngFor="let reservation of reservations">
                  <td>#{{ reservation.id }}</td>
                  <td>{{ reservation.user?.name }} {{ reservation.user?.lastName }}<small>{{ reservation.user?.email }}</small></td>
                  <td>{{ reservation.shuttles.length }}</td>
                  <td>{{ reservation.createdAt | date:'medium' }}</td>
                  <td class="table-actions">
                    <button type="button" class="secondary-action" (click)="openEdit('reservation', reservation)">Edit</button>
                    <button type="button" class="remove-transfer" (click)="deleteReservation(reservation)">Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="admin-panel" *ngIf="activeTab === 'company'">
          <div class="admin-panel-heading">
            <div>
              <p class="eyebrow">Company data</p>
              <h2>Default business profile and contact methods</h2>
            </div>
          </div>

          <form class="admin-form admin-create-form company-create-form" #companyForm="ngForm" (ngSubmit)="createCompany()" *ngIf="!companies.length">
            <input name="newCompanyName" placeholder="Company name" [(ngModel)]="newCompany.name" required>
            <input type="email" name="newCompanyEmail" placeholder="Email" [(ngModel)]="newCompany.email" required>
            <input name="newCompanyTagline" placeholder="Tagline" [(ngModel)]="newCompany.tagline">
            <input name="newCompanyWebsite" placeholder="Website" [(ngModel)]="newCompany.website">
            <input name="newCompanyAddress" placeholder="Address" [(ngModel)]="newCompany.address">
            <select name="newCompanyPhoneType" [(ngModel)]="newCompanyPhone.type">
              <option value="phone">Phone</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="email">Email</option>
              <option value="social">Social</option>
            </select>
            <input name="newCompanyPhoneLabel" placeholder="Contact label" [(ngModel)]="newCompanyPhone.label">
            <input name="newCompanyPhoneNumber" placeholder="Contact value" [(ngModel)]="newCompanyPhone.number">
            <input name="newCompanyPhoneHref" placeholder="Link / href" [(ngModel)]="newCompanyPhone.href">
            <button type="submit" class="primary-action" [disabled]="companyForm.invalid">Create default company</button>
          </form>

          <div class="admin-table-wrap">
            <table class="admin-table">
              <thead><tr><th>Company</th><th>Email</th><th>Contact methods</th><th>Actions</th></tr></thead>
              <tbody>
                <tr *ngFor="let company of companies">
                  <td>{{ company.name }}<small>{{ company.tagline }}</small></td>
                  <td>{{ company.email }}<small>{{ company.website }}</small></td>
                  <td>
                    <span class="admin-chip" *ngFor="let phone of company.phones">{{ phone.label || phone.code }}: {{ phone.number }}</span>
                  </td>
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

          <form class="admin-form admin-create-form" #messageForm="ngForm" (ngSubmit)="createMessage()">
            <input name="newMessageName" placeholder="Name" [(ngModel)]="newMessage.name" required>
            <input name="newMessagePhone" placeholder="Phone" [(ngModel)]="newMessage.phone">
            <input type="email" name="newMessageEmail" placeholder="Email" [(ngModel)]="newMessage.email" required>
            <textarea name="newMessageText" rows="2" placeholder="Message" [(ngModel)]="newMessage.text" required></textarea>
            <button type="submit" class="primary-action" [disabled]="messageForm.invalid">Add message</button>
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

          <form class="admin-form admin-create-form" #userForm="ngForm" (ngSubmit)="createPrivilegedUser()">
            <input name="privName" placeholder="First name" [(ngModel)]="newUser.name" required>
            <input name="privLastName" placeholder="Last name" [(ngModel)]="newUser.lastName" required>
            <input name="privPhone" placeholder="Phone" [(ngModel)]="newUser.phone">
            <input type="email" name="privEmail" placeholder="Email" [(ngModel)]="newUser.email" required>
            <input type="password" name="privPassword" placeholder="Password" [(ngModel)]="newUser.password" required>
            <select name="privRole" [(ngModel)]="newUser.role">
              <option value="ADMIN">ADMIN</option>
              <option value="SUPER">SUPER</option>
            </select>
            <button type="submit" class="primary-action" [disabled]="userForm.invalid">Create privileged user</button>
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
              <input name="editPlaceName" placeholder="Destination name" [(ngModel)]="editModal.data.name" required>
              <textarea name="editPlaceDescription" rows="4" placeholder="Description" [(ngModel)]="editModal.data.description" required></textarea>
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
              <input name="editTestimonialName" placeholder="Name" [(ngModel)]="editModal.data.name" required>
              <input name="editTestimonialLocation" placeholder="Location" [(ngModel)]="editModal.data.location" required>
              <input name="editTestimonialRoute" placeholder="Route" [(ngModel)]="editModal.data.route" required>
              <input type="number" min="1" max="5" name="editTestimonialRating" placeholder="Rating" [(ngModel)]="editModal.data.rating" required>
              <textarea name="editTestimonialComment" rows="4" placeholder="Comment" [(ngModel)]="editModal.data.comment" required></textarea>
              <label class="admin-check"><input type="checkbox" name="editTestimonialActive" [(ngModel)]="editModal.data.active"> Active</label>
            </ng-container>

            <ng-container *ngSwitchCase="'fixedRoute'">
              <select name="editFixedDeparting" [(ngModel)]="editModal.data.departingId" required>
                <option [ngValue]="0">Departing</option>
                <option *ngFor="let place of places" [ngValue]="place.id">{{ place.name }}</option>
              </select>
              <select name="editFixedDestination" [(ngModel)]="editModal.data.destinationId" required>
                <option [ngValue]="0">Going to</option>
                <option *ngFor="let place of places" [ngValue]="place.id">{{ place.name }}</option>
              </select>
              <input type="number" min="0" step="0.01" name="editFixedPrice" placeholder="Fixed price" [(ngModel)]="editModal.data.price" required>
              <input name="editFixedLabel" placeholder="Label" [(ngModel)]="editModal.data.label">
              <textarea name="editFixedNotes" rows="4" placeholder="Specific service notes" [(ngModel)]="editModal.data.notes"></textarea>
              <label class="admin-check"><input type="checkbox" name="editFixedActive" [(ngModel)]="editModal.data.active"> Active</label>
            </ng-container>

            <ng-container *ngSwitchCase="'pricingRule'">
              <input name="editRuleName" placeholder="Rule name" [(ngModel)]="editModal.data.name" required>
              <div class="admin-modal-sublist compact-fields">
                <input type="number" step="0.1" min="0" name="editRuleMin" placeholder="Min km" [(ngModel)]="editModal.data.minDistance" required>
                <input type="number" step="0.1" min="0" name="editRuleMax" placeholder="Max km" [(ngModel)]="editModal.data.maxDistance" required>
                <input type="number" step="0.01" min="0" name="editRulePrice" placeholder="Price/km" [(ngModel)]="editModal.data.pricePerKm" required>
                <input type="number" step="0.01" min="0" name="editRuleDiscount" placeholder="Discount" [(ngModel)]="editModal.data.discount" required>
                <input type="number" step="1" min="0" name="editRuleOrder" placeholder="Order" [(ngModel)]="editModal.data.sortOrder" required>
                <label class="admin-check"><input type="checkbox" name="editRuleActive" [(ngModel)]="editModal.data.active"> Active</label>
              </div>
            </ng-container>

            <ng-container *ngSwitchCase="'serviceRule'">
              <input name="editServiceTitle" placeholder="Rule title" [(ngModel)]="editModal.data.title" required>
              <input type="number" min="0" name="editServiceOrder" placeholder="Order" [(ngModel)]="editModal.data.sortOrder" required>
              <textarea name="editServiceDescription" rows="4" placeholder="What should the team know?" [(ngModel)]="editModal.data.description" required></textarea>
              <label class="admin-check"><input type="checkbox" name="editServiceActive" [(ngModel)]="editModal.data.active"> Active</label>
            </ng-container>

            <ng-container *ngSwitchCase="'reservation'">
              <textarea name="editReservationMessage" rows="4" placeholder="Reservation notes" [(ngModel)]="editModal.data.message"></textarea>
              <div class="admin-modal-sublist" *ngFor="let shuttle of editModal.data.shuttles; let i = index">
                <select name="editShuttleDeparting{{ i }}" [(ngModel)]="shuttle.departingId">
                  <option [ngValue]="undefined">Departing</option>
                  <option *ngFor="let place of places" [ngValue]="place.id">{{ place.name }}</option>
                </select>
                <select name="editShuttleDestination{{ i }}" [(ngModel)]="shuttle.destinationId">
                  <option [ngValue]="undefined">Going to</option>
                  <option *ngFor="let place of places" [ngValue]="place.id">{{ place.name }}</option>
                </select>
                <input type="datetime-local" name="editShuttleDate{{ i }}" [(ngModel)]="shuttle.date">
                <input type="number" min="1" name="editShuttlePersons{{ i }}" [(ngModel)]="shuttle.persons">
                <button type="button" class="remove-transfer" (click)="deleteShuttleFromModal(shuttle)">Delete transfer</button>
              </div>
            </ng-container>

            <ng-container *ngSwitchCase="'company'">
              <input name="editCompanyName" placeholder="Company name" [(ngModel)]="editModal.data.name" required>
              <input type="email" name="editCompanyEmail" placeholder="Email" [(ngModel)]="editModal.data.email" required>
              <input name="editCompanyTagline" placeholder="Tagline" [(ngModel)]="editModal.data.tagline">
              <input name="editCompanyWebsite" placeholder="Website" [(ngModel)]="editModal.data.website">
              <input name="editCompanyAddress" placeholder="Address" [(ngModel)]="editModal.data.address">
              <label class="admin-check"><input type="checkbox" name="editCompanyDefault" [(ngModel)]="editModal.data.isDefault"> Default company</label>
              <div class="admin-modal-sublist" *ngFor="let phone of editModal.data.phones; let i = index">
                <select name="editPhoneType{{ i }}" [(ngModel)]="phone.type">
                  <option value="phone">Phone</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Email</option>
                  <option value="social">Social</option>
                </select>
                <input name="editPhoneLabel{{ i }}" placeholder="Label" [(ngModel)]="phone.label">
                <input name="editPhoneNumber{{ i }}" placeholder="Value" [(ngModel)]="phone.number">
                <input name="editPhoneHref{{ i }}" placeholder="Link / href" [(ngModel)]="phone.href">
                <input type="number" name="editPhoneOrder{{ i }}" placeholder="Order" [(ngModel)]="phone.sortOrder">
                <label class="admin-check"><input type="checkbox" name="editPhoneActive{{ i }}" [(ngModel)]="phone.active"> Active</label>
                <button type="button" class="remove-transfer" (click)="deletePhoneFromModal(phone)">Delete phone</button>
              </div>
              <div class="admin-modal-sublist">
                <select name="modalPhoneType" [(ngModel)]="editModal.data.newPhoneType">
                  <option value="phone">Phone</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Email</option>
                  <option value="social">Social</option>
                </select>
                <input name="modalPhoneLabel" placeholder="New label" [(ngModel)]="editModal.data.newPhoneLabel">
                <input name="modalPhoneNumber" placeholder="New value" [(ngModel)]="editModal.data.newPhoneNumber">
                <input name="modalPhoneHref" placeholder="New link / href" [(ngModel)]="editModal.data.newPhoneHref">
                <input type="number" name="modalPhoneOrder" placeholder="Order" [(ngModel)]="editModal.data.newPhoneSortOrder">
                <button type="button" class="secondary-action" (click)="createPhoneFromModal()">Add contact</button>
              </div>
            </ng-container>

            <ng-container *ngSwitchCase="'message'">
              <input name="editMessageName" placeholder="Name" [(ngModel)]="editModal.data.name" required>
              <input name="editMessagePhone" placeholder="Phone" [(ngModel)]="editModal.data.phone">
              <input type="email" name="editMessageEmail" placeholder="Email" [(ngModel)]="editModal.data.email" required>
              <textarea name="editMessageText" rows="4" placeholder="Message" [(ngModel)]="editModal.data.text" required></textarea>
            </ng-container>

            <ng-container *ngSwitchCase="'user'">
              <input name="editUserName" placeholder="First name" [(ngModel)]="editModal.data.name" required>
              <input name="editUserLastName" placeholder="Last name" [(ngModel)]="editModal.data.lastName" required>
              <input name="editUserPhone" placeholder="Phone" [(ngModel)]="editModal.data.phone">
              <input name="editUserEmail" placeholder="Email" [(ngModel)]="editModal.data.email" disabled>
              <select name="editUserRole" [(ngModel)]="editModal.data.role">
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
                <option value="SUPER">SUPER</option>
              </select>
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

  newPlace: AdminPlace = { name: '', description: '', image: '' };
  newHeroImage: HeroImage = { src: '' };
  newTestimonial: Testimonial = { id: 0, name: '', location: '', route: '', rating: 5, comment: '', active: true };
  newCompany: AdminCompany = { name: 'CR Travel Service', email: 'reservations@crtravelservice.com', tagline: 'Private shuttle transportation in Costa Rica', address: 'Costa Rica', website: 'https://crtravelservice.com', isDefault: true };
  newCompanyPhone: AdminPhone = { type: 'phone', label: 'Costa Rica', code: 'Costa Rica', number: '', href: '', active: true, sortOrder: 1 };
  newMessage: AdminMessage = { name: '', phone: '', email: '', text: '' };
  newUser = { name: '', lastName: '', phone: '', email: '', password: '', role: 'ADMIN' as 'ADMIN' | 'SUPER' };
  newFixedRoutePrice: FixedRoutePrice = this.emptyFixedRoutePrice();
  newPricingRule: PriceRule = this.emptyPricingRule();
  newServiceRule: ServicePricingRule = this.emptyServiceRule();
  editModal: { type: ModalType; title: string; data: any } | null = null;
  uploadBusy = false;
  message = '';
  error = '';

  constructor(
    private readonly admin: AdminService,
    public readonly auth: AuthService
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

  handleImageFile(event: Event, target: 'newPlace' | 'newHero' | 'modal'): void {
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
        this.newCompany = { name: 'CR Travel Service', email: 'reservations@crtravelservice.com', tagline: 'Private shuttle transportation in Costa Rica', address: 'Costa Rica', website: 'https://crtravelservice.com', isDefault: true };
        this.newCompanyPhone = { type: 'phone', label: 'Costa Rica', code: 'Costa Rica', number: '', href: '', active: true, sortOrder: 1 };
        this.done('Company created.');
        this.loadCompanies();
      },
      error: (error) => this.fail(error)
    });
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

  private setImageTarget(target: 'newPlace' | 'newHero' | 'modal', src: string): void {
    if (target === 'newPlace') {
      this.newPlace.image = src;
    } else if (target === 'newHero') {
      this.newHeroImage.src = src;
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
    return { departingId: 0, destinationId: 0, price: 0, label: '', notes: '', active: true };
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
