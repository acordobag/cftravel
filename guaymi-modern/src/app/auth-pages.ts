import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from './auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="auth-page">
      <div class="auth-panel">
        <p class="eyebrow">Privileged access</p>
        <h1>Login</h1>
        <p>Access your travel account or the CR Travel Service maintenance dashboard.</p>
        <form class="auth-form" #form="ngForm" (ngSubmit)="submit()">
          <input type="email" name="email" placeholder="Email" [(ngModel)]="email" required>
          <input type="password" name="password" placeholder="Password" [(ngModel)]="password" required>
          <button type="submit" class="primary-action" [disabled]="form.invalid || loading">{{ loading ? 'Signing in...' : 'Login' }}</button>
          <p class="error" *ngIf="error">{{ error }}</p>
        </form>
        <a routerLink="/signup">Create a customer account</a>
      </div>
    </section>
  `
})
export class LoginPageComponent {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  submit(): void {
    this.loading = true;
    this.error = '';

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        this.router.navigateByUrl(returnUrl || (this.auth.isPrivileged() ? '/admin' : '/account'));
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Could not login.';
      }
    });
  }
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="auth-page">
      <div class="auth-panel">
        <p class="eyebrow">Customer account</p>
        <h1>Signup</h1>
        <p>Create a regular customer account. Admin users are created only by the super user.</p>
        <form class="auth-form" #form="ngForm" (ngSubmit)="submit()">
          <input name="name" placeholder="First name" [(ngModel)]="model.name" required>
          <input name="lastName" placeholder="Last name" [(ngModel)]="model.lastName" required>
          <input name="phone" placeholder="Phone" [(ngModel)]="model.phone" required>
          <input type="email" name="email" placeholder="Email" [(ngModel)]="model.email" required>
          <input type="password" name="password" placeholder="Password" [(ngModel)]="model.password" required>
          <button type="submit" class="primary-action" [disabled]="form.invalid || loading">{{ loading ? 'Creating...' : 'Create account' }}</button>
          <p class="error" *ngIf="error">{{ error }}</p>
        </form>
        <a routerLink="/login">Already have an account?</a>
      </div>
    </section>
  `
})
export class SignupPageComponent {
  model = { name: '', lastName: '', phone: '', email: '', password: '' };
  loading = false;
  error = '';

  constructor(private readonly auth: AuthService, private readonly router: Router) {}

  submit(): void {
    this.loading = true;
    this.error = '';

    this.auth.signup(this.model).subscribe({
      next: () => this.router.navigate(['/account']),
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Could not create account.';
      }
    });
  }
}
