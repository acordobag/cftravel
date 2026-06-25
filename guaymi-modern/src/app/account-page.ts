import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AccountReservation, AccountService } from './account.service';
import { AuthService } from './auth.service';
import { I18nService } from './i18n.service';
import { PhoneFieldComponent } from './phone-field.component';

type AccountTab = 'profile' | 'reservations' | 'review';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PhoneFieldComponent],
  template: `
    <section class="account-page">
      <div class="account-shell">
        <header class="account-header">
          <div>
            <p class="eyebrow">{{ i18n.tx().account.eyebrow }}</p>
            <h1>{{ i18n.tx().account.heading }}</h1>
            <p>{{ i18n.tx().account.p }}</p>
          </div>
          <a routerLink="/reservation" class="primary-action">{{ i18n.tx().account.newBooking }}</a>
        </header>

        <nav class="admin-tabs admin-tabs-buttons account-tabs" aria-label="Account sections">
          <button type="button" [class.active]="activeTab === 'profile'" (click)="activeTab = 'profile'">{{ i18n.tx().account.tabProfile }}</button>
          <button type="button" [class.active]="activeTab === 'reservations'" (click)="activeTab = 'reservations'">{{ i18n.tx().account.tabReservations }}</button>
          <button type="button" [class.active]="activeTab === 'review'" [disabled]="!hasCompletedShuttles" [title]="hasCompletedShuttles ? '' : i18n.tx().account.reviewLockedTip" (click)="hasCompletedShuttles && (activeTab = 'review')">{{ i18n.tx().account.tabReview }}</button>
        </nav>

        <p class="success" *ngIf="message">{{ message }}</p>
        <p class="error" *ngIf="error">{{ error }}</p>

        <div class="cancel-modal-overlay" *ngIf="cancelModal" (click)="closeCancelModal()">
          <div class="cancel-modal" (click)="$event.stopPropagation()">
            <h3>{{ i18n.tx().account.cancelModalTitle }}</h3>
            <p *ngIf="cancelPreview && cancelPreview.canCancel">
              {{ i18n.tx().account.cancelModalFeeMsg.replace('{fee}', cancelPreview.fee.toFixed(2)).replace('{pct}', cancelPreview.feePercent.toString()) }}
            </p>
            <p *ngIf="cancelPreview && !cancelPreview.canCancel">
              {{ i18n.tx().account.cancelModalTooLate.replace('{hours}', cancelPreview.minHours.toString()) }}
            </p>
            <p *ngIf="!cancelPreview">{{ i18n.tx().account.cancelModalLoading }}</p>
            <div class="cancel-modal-actions">
              <button type="button" class="secondary-action" (click)="closeCancelModal()">{{ i18n.tx().account.cancelModalClose }}</button>
              <button type="button" class="remove-transfer" (click)="confirmCancel()" *ngIf="cancelPreview && cancelPreview.canCancel" [disabled]="cancellingId !== null">
                {{ i18n.tx().account.cancelModalConfirm }}
              </button>
            </div>
          </div>
        </div>

        <section class="account-grid" *ngIf="activeTab === 'profile'">
          <article class="account-card account-summary-card">
            <p class="eyebrow">{{ i18n.tx().account.profileSignedIn }}</p>
            <h2>{{ profile.name }} {{ profile.lastName }}</h2>
            <p>{{ profile.email }}</p>
            <span>{{ profile.phone || i18n.tx().account.noPhone }}</span>
          </article>

          <article class="account-card">
            <div class="account-card-heading">
              <p class="eyebrow">{{ i18n.tx().account.profileEyebrow }}</p>
              <h2>{{ i18n.tx().account.profileHeading }}</h2>
            </div>
            <form class="account-form" #profileForm="ngForm" (ngSubmit)="saveProfile()">
              <input name="name" [placeholder]="i18n.tx().account.firstName" [(ngModel)]="profile.name" required>
              <input name="lastName" [placeholder]="i18n.tx().account.lastName" [(ngModel)]="profile.lastName" required>
              <app-phone-field name="phone" placeholder="8888 8888" [(ngModel)]="profile.phone"></app-phone-field>
              <input type="email" name="email" [placeholder]="i18n.tx().account.emailDisabled" [(ngModel)]="profile.email" disabled>
              <input type="password" name="password" [placeholder]="i18n.tx().account.newPassword" [(ngModel)]="profile.password">
              <button type="submit" class="primary-action" [disabled]="profileForm.invalid || loading">{{ loading ? i18n.tx().account.saving : i18n.tx().account.saveBtn }}</button>
            </form>
          </article>
        </section>

        <section class="account-card" *ngIf="activeTab === 'reservations'">
          <div class="account-card-heading">
            <p class="eyebrow">{{ i18n.tx().account.bookingsEyebrow }}</p>
            <h2>{{ i18n.tx().account.bookingsHeading }}</h2>
          </div>

          <div class="empty-state" *ngIf="!reservations.length">
            <h3>{{ i18n.tx().account.noReservations }}</h3>
            <p>{{ i18n.tx().account.noReservationsP }}</p>
            <a routerLink="/reservation" class="secondary-action">{{ i18n.tx().account.firstBooking }}</a>
          </div>

          <div class="account-reservation-list" *ngIf="reservations.length">
            <article class="reservation-record" *ngFor="let reservation of reservations">
              <header>
                <div>
                  <span>{{ i18n.tx().account.reservationLabel }} #{{ reservation.id }}</span>
                  <strong>{{ reservation.createdAt | date:'mediumDate' }}</strong>
                </div>
                <small>{{ reservation.shuttles.length }} {{ reservation.shuttles.length === 1 ? i18n.tx().reservation.transfer : i18n.tx().reservation.transfers }}</small>
              </header>
              <div class="reservation-record-transfer" *ngFor="let shuttle of reservation.shuttles">
                <div>
                  <strong>{{ shuttle.departing?.name || i18n.tx().booking.departing }} → {{ shuttle.destination?.name || i18n.tx().booking.destination }}</strong>
                  <span>{{ shuttle.date | date:'medium' }} · {{ shuttle.persons }} {{ shuttle.persons === 1 ? i18n.tx().account.passenger : i18n.tx().account.passengers }}</span>
                </div>
                <strong class="money">{{ shuttle.rate | currency:'USD':'symbol':'1.2-2' }}</strong>
              </div>
              <p *ngIf="reservation.message">{{ reservation.message }}</p>
              <p class="reservation-company-note" *ngIf="reservation.companyNotes"><strong>Note from our team:</strong> {{ reservation.companyNotes }}</p>
              <div class="reservation-record-actions" *ngIf="!reservation.status || reservation.status === 'pending'">
                <button type="button" class="cancel-reservation-btn" (click)="openCancelModal(reservation.id)" [disabled]="cancellingId === reservation.id">
                  {{ cancellingId === reservation.id ? i18n.tx().account.cancelling : i18n.tx().account.cancelBtn }}
                </button>
              </div>
              <div class="reservation-status-badge reservation-status-confirmed" *ngIf="reservation.status === 'confirmed'">
                {{ i18n.tx().account.confirmedBadge }}
              </div>
              <div class="reservation-status-badge reservation-status-cancelled" *ngIf="reservation.status === 'cancelled'">
                {{ i18n.tx().account.cancelledBadge }}
              </div>
            </article>
          </div>
        </section>

        <section class="account-card" *ngIf="activeTab === 'review'">
          <div class="account-card-heading">
            <p class="eyebrow">{{ i18n.tx().account.reviewEyebrow }}</p>
            <h2>{{ i18n.tx().account.reviewHeading }}</h2>
            <p>{{ i18n.tx().account.reviewP }}</p>
          </div>

          <form class="account-form" #reviewForm="ngForm" (ngSubmit)="submitReview()" *ngIf="!reviewSent">
            <label>
              <span>{{ i18n.tx().account.reviewName }}</span>
              <input name="reviewName" placeholder="Mariana G." [(ngModel)]="review.name">
            </label>
            <label>
              <span>{{ i18n.tx().account.reviewLocation }}</span>
              <input #reviewLocationInput name="reviewLocation" placeholder="New York, USA" [(ngModel)]="review.location" autocomplete="off">
            </label>
            <label>
              <span>{{ i18n.tx().account.reviewRoute }}</span>
              <select name="reviewRoute" [(ngModel)]="review.route" required>
                <option value="" disabled>—</option>
                <option *ngFor="let route of completedRoutes" [value]="route">{{ route }}</option>
              </select>
            </label>
            <label style="grid-column:1/-1">
              <span>{{ i18n.tx().account.reviewRating }}</span>
              <div class="star-picker">
                <button type="button" *ngFor="let star of [1,2,3,4,5]"
                  [class.star-on]="star <= review.rating"
                  (click)="review.rating = star"
                  [attr.aria-label]="star + ' star' + (star > 1 ? 's' : '')">&#9733;</button>
              </div>
            </label>
            <label style="grid-column:1/-1">
              <span>{{ i18n.tx().account.reviewComment }} <span class="required-mark">*</span></span>
              <textarea name="reviewComment" placeholder="..." rows="4" [(ngModel)]="review.comment" required></textarea>
            </label>
            <button type="submit" class="primary-action" [disabled]="reviewForm.invalid || loading">{{ loading ? i18n.tx().account.reviewLoading : i18n.tx().account.reviewBtn }}</button>
          </form>

          <div class="review-sent" *ngIf="reviewSent">
            <p class="eyebrow">{{ i18n.tx().account.reviewSentEyebrow }}</p>
            <h3>{{ i18n.tx().account.reviewSentHeading }}</h3>
            <p>{{ i18n.tx().account.reviewSentP }}</p>
            <button type="button" class="secondary-action" (click)="resetReview()">{{ i18n.tx().account.reviewSentBtn }}</button>
          </div>
        </section>
      </div>
    </section>
  `
})
export class AccountPageComponent implements OnInit, AfterViewInit {
  @ViewChild('reviewLocationInput') reviewLocationInput?: ElementRef<HTMLInputElement>;

  activeTab: AccountTab = 'profile';
  reservations: (AccountReservation & { status?: string })[] = [];
  profile = { name: '', lastName: '', phone: '', email: '', password: '' };
  review = { name: '', location: '', route: '', rating: 5, comment: '' };
  reviewSent = false;
  loading = false;
  message = '';
  error = '';
  cancelModal = false;
  cancellingId: number | null = null;
  cancelTargetId: number | null = null;
  cancelPreview: { canCancel: boolean; fee: number; feePercent: number; minHours: number; hoursUntil: number } | null = null;

  constructor(
    private readonly account: AccountService,
    private readonly auth: AuthService,
    public readonly i18n: I18nService,
    private readonly zone: NgZone,
  ) {}

  ngAfterViewInit(): void {
    this.attachLocationAutocomplete(0);
  }

  private attachLocationAutocomplete(attempts: number): void {
    const maps = (globalThis as any).google?.maps;
    if (!this.reviewLocationInput || !maps?.places?.Autocomplete) {
      if (attempts < 12) {
        window.setTimeout(() => this.attachLocationAutocomplete(attempts + 1), 500);
      }
      return;
    }

    const ac = new (globalThis as any).google.maps.places.Autocomplete(this.reviewLocationInput.nativeElement, {
      types: ['(cities)'],
      fields: ['formatted_address', 'name'],
    });

    ac.addListener('place_changed', () => {
      this.zone.run(() => {
        const place = ac.getPlace();
        this.review.location = place.formatted_address || place.name || this.review.location;
      });
    });
  }

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
      this.review.name = `${user.name || ''} ${user.lastName || ''}`.trim();
    }

    this.loadReservations();
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

  submitReview(): void {
    this.loading = true;
    this.error = '';

    this.account.submitReview(this.review).subscribe({
      next: () => {
        this.loading = false;
        this.reviewSent = true;
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Could not submit your review. Please try again.';
      }
    });
  }

  resetReview(): void {
    const user = this.auth.currentUser();
    this.review = {
      name: user ? `${user.name || ''} ${user.lastName || ''}`.trim() : '',
      location: '',
      route: this.completedRoutes[0] || '',
      rating: 5,
      comment: ''
    };
    this.reviewSent = false;
  }

  get hasCompletedShuttles(): boolean {
    const now = Date.now();
    return this.reservations.some((r) =>
      r.shuttles.some((s) => new Date(s.date).getTime() < now)
    );
  }

  get completedRoutes(): string[] {
    const now = Date.now();
    const routes: string[] = [];
    for (const r of this.reservations) {
      for (const s of r.shuttles) {
        if (new Date(s.date).getTime() < now && s.departing && s.destination) {
          const label = `${s.departing.name} → ${s.destination.name}`;
          if (!routes.includes(label)) {
            routes.push(label);
          }
        }
      }
    }
    return routes;
  }

  openCancelModal(reservationId: number): void {
    this.cancelTargetId = reservationId;
    this.cancelModal = true;
    this.cancelPreview = null;
    this.account.getCancelPreview(reservationId).subscribe({
      next: (preview) => this.cancelPreview = preview,
      error: () => this.closeCancelModal()
    });
  }

  closeCancelModal(): void {
    this.cancelModal = false;
    this.cancelTargetId = null;
    this.cancelPreview = null;
  }

  confirmCancel(): void {
    if (!this.cancelTargetId) return;
    this.cancellingId = this.cancelTargetId;
    this.account.cancelReservation(this.cancelTargetId).subscribe({
      next: () => {
        const id = this.cancelTargetId;
        const r = this.reservations.find((res) => res.id === id);
        if (r) (r as any).status = 'cancelled';
        this.cancellingId = null;
        this.message = this.i18n.tx().account.cancelSuccess;
        this.closeCancelModal();
      },
      error: (err) => {
        this.cancellingId = null;
        this.error = err.error?.message || 'Could not cancel reservation.';
        this.closeCancelModal();
      }
    });
  }

  private loadReservations(): void {
    this.account.getReservations().subscribe({
      next: (reservations) => {
        this.reservations = reservations;
        if (!this.review.route) {
          this.review.route = this.completedRoutes[0] || '';
        }
      },
      error: (error) => this.error = error.error?.message || 'Could not load reservations.'
    });
  }

}
