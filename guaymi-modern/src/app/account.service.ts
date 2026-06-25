import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs';

import { AuthService, AuthUser } from './auth.service';

import { environment } from '../environments/environment';
const API_URL = environment.apiUrl;

export interface AccountReservation {
  id: number;
  message: string;
  status?: string;
  companyNotes?: string;
  createdAt: string;
  shuttles: Array<{
    id: number;
    date: string;
    persons: number;
    rate: number;
    distance: number;
    departing?: { id: number; name: string };
    destination?: { id: number; name: string };
  }>;
}


@Injectable({ providedIn: 'root' })
export class AccountService {
  constructor(private readonly http: HttpClient, private readonly auth: AuthService) {}

  updateProfile(profile: Partial<AuthUser> & { password?: string }) {
    return this.http.put<AuthUser>(`${API_URL}/account/profile`, profile, this.auth.authOptions()).pipe(
      tap((user) => this.auth.setCurrentUser(user))
    );
  }

  getReservations() {
    return this.http.get<AccountReservation[]>(`${API_URL}/account/reservations`, this.auth.authOptions());
  }

  submitReview(review: { name: string; location: string; route: string; rating: number; comment: string }) {
    return this.http.post(`${API_URL}/testimonial`, review, this.auth.authOptions());
  }

  getCancelPreview(reservationId: number) {
    return this.http.get<{ canCancel: boolean; fee: number; feePercent: number; minHours: number; hoursUntil: number }>(
      `${API_URL}/reservation/${reservationId}/cancel-preview`,
      this.auth.authOptions()
    );
  }

  cancelReservation(reservationId: number) {
    return this.http.post<{ success: boolean; fee: number; feePercent: number }>(
      `${API_URL}/reservation/${reservationId}/cancel`,
      {},
      this.auth.authOptions()
    );
  }
}
