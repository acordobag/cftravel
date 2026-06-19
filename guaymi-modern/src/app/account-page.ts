import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AccountMessage, AccountReservation, AccountService } from './account.service';
import { AuthService } from './auth.service';

type AccountTab = 'profile' | 'reservations' | 'messages';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="account-page">
      <div class="account-shell">
        <header class="account-header">
          <div>
            <p class="eyebrow">Customer account</p>
            <h1>My travel dashboard</h1>
            <p>Update your details, review booking requests, and read internal trip messages.</p>
          </div>
          <a routerLink="/reservation" class="primary-action">New booking</a>
        </header>

        <nav class="admin-tabs admin-tabs-buttons account-tabs" aria-label="Account sections">
          <button type="button" [class.active]="activeTab === 'profile'" (click)="activeTab = 'profile'">Profile</button>
          <button type="button" [class.active]="activeTab === 'reservations'" (click)="activeTab = 'reservations'">Reservations</button>
          <button type="button" [class.active]="activeTab === 'messages'" (click)="activeTab = 'messages'">Messages</button>
        </nav>

        <p class="success" *ngIf="message">{{ message }}</p>
        <p class="error" *ngIf="error">{{ error }}</p>

        <section class="account-grid" *ngIf="activeTab === 'profile'">
          <article class="account-card account-summary-card">
            <p class="eyebrow">Signed in as</p>
            <h2>{{ profile.name }} {{ profile.lastName }}</h2>
            <p>{{ profile.email }}</p>
            <span>{{ profile.phone || 'No phone saved' }}</span>
          </article>

          <article class="account-card">
            <div class="account-card-heading">
              <p class="eyebrow">Profile</p>
              <h2>Contact details</h2>
            </div>
            <form class="account-form" #profileForm="ngForm" (ngSubmit)="saveProfile()">
              <input name="name" placeholder="First name" [(ngModel)]="profile.name" required>
              <input name="lastName" placeholder="Last name" [(ngModel)]="profile.lastName" required>
              <input name="phone" placeholder="Phone" [(ngModel)]="profile.phone">
              <input type="email" name="email" placeholder="Email" [(ngModel)]="profile.email" disabled>
              <input type="password" name="password" placeholder="New password optional" [(ngModel)]="profile.password">
              <button type="submit" class="primary-action" [disabled]="profileForm.invalid || loading">{{ loading ? 'Saving...' : 'Save profile' }}</button>
            </form>
          </article>
        </section>

        <section class="account-card" *ngIf="activeTab === 'reservations'">
          <div class="account-card-heading">
            <p class="eyebrow">Bookings</p>
            <h2>My reservations</h2>
          </div>

          <div class="empty-state" *ngIf="!reservations.length">
            <h3>No reservations yet</h3>
            <p>Your booking requests will appear here after you send them.</p>
            <a routerLink="/reservation" class="secondary-action">Create first booking</a>
          </div>

          <div class="account-reservation-list" *ngIf="reservations.length">
            <article class="reservation-record" *ngFor="let reservation of reservations">
              <header>
                <div>
                  <span>Reservation #{{ reservation.id }}</span>
                  <strong>{{ reservation.createdAt | date:'mediumDate' }}</strong>
                </div>
                <small>{{ reservation.shuttles.length }} transfer{{ reservation.shuttles.length === 1 ? '' : 's' }}</small>
              </header>
              <div class="reservation-record-transfer" *ngFor="let shuttle of reservation.shuttles">
                <div>
                  <strong>{{ shuttle.departing?.name || 'Departing' }} to {{ shuttle.destination?.name || 'Destination' }}</strong>
                  <span>{{ shuttle.date | date:'medium' }} · {{ shuttle.persons }} passenger{{ shuttle.persons === 1 ? '' : 's' }}</span>
                </div>
                <strong class="money">{{ shuttle.rate | currency:'USD':'symbol':'1.2-2' }}</strong>
              </div>
              <p *ngIf="reservation.message">{{ reservation.message }}</p>
            </article>
          </div>
        </section>

        <section class="account-card" *ngIf="activeTab === 'messages'">
          <div class="account-card-heading">
            <p class="eyebrow">Internal messages</p>
            <h2>Trip updates</h2>
          </div>

          <div class="message-list">
            <article class="message-record" *ngFor="let item of messages">
              <div>
                <span>{{ item.kind || 'info' }}</span>
                <h3>{{ item.title }}</h3>
                <p>{{ item.body }}</p>
              </div>
              <small>{{ item.createdAt | date:'mediumDate' }}</small>
            </article>
          </div>
        </section>
      </div>
    </section>
  `
})
export class AccountPageComponent implements OnInit {
  activeTab: AccountTab = 'profile';
  reservations: AccountReservation[] = [];
  messages: AccountMessage[] = [];
  profile = { name: '', lastName: '', phone: '', email: '', password: '' };
  loading = false;
  message = '';
  error = '';

  constructor(
    private readonly account: AccountService,
    private readonly auth: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.auth.currentUser();
    if (user) {
      this.profile = {
        name: user.name || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        email: user.email || '',
        password: ''
      };
    }

    this.loadReservations();
    this.loadMessages();
  }

  saveProfile(): void {
    this.loading = true;
    this.message = '';
    this.error = '';

    this.account.updateProfile(this.profile).subscribe({
      next: () => {
        this.profile.password = '';
        this.loading = false;
        this.message = 'Profile updated.';
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Could not update your profile.';
      }
    });
  }

  private loadReservations(): void {
    this.account.getReservations().subscribe({
      next: (reservations) => this.reservations = reservations,
      error: (error) => this.error = error.error?.message || 'Could not load reservations.'
    });
  }

  private loadMessages(): void {
    this.account.getMessages().subscribe({
      next: (messages) => this.messages = messages,
      error: (error) => this.error = error.error?.message || 'Could not load messages.'
    });
  }
}
