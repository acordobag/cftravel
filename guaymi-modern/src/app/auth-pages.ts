import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { I18nService } from './i18n.service';
import { AuthService } from './auth.service';
import { PhoneFieldComponent } from './phone-field.component';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="auth-page">
      <div class="auth-panel">
        <p class="eyebrow">{{ i18n.tx().login.eyebrow }}</p>
        <h1>{{ i18n.tx().login.heading }}</h1>
        <p>{{ i18n.tx().login.p }}</p>
        <form class="auth-form" #form="ngForm" (ngSubmit)="submit()">
          <input type="email" name="email" [placeholder]="i18n.tx().login.email" [(ngModel)]="email" required>
          <input type="password" name="password" [placeholder]="i18n.tx().login.password" [(ngModel)]="password" required>
          <button type="submit" class="primary-action" [disabled]="form.invalid || loading">{{ loading ? i18n.tx().login.loading : i18n.tx().login.btn }}</button>
          <p class="error" *ngIf="error">{{ error }}</p>
        </form>
        <a routerLink="/signup">{{ i18n.tx().login.signupLink }}</a>
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
    private readonly route: ActivatedRoute,
    public readonly i18n: I18nService,
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
  imports: [CommonModule, FormsModule, RouterLink, PhoneFieldComponent],
  template: `
    <section class="auth-page">
      <div class="auth-panel">
        <p class="eyebrow">{{ i18n.tx().signup.eyebrow }}</p>
        <h1>{{ i18n.tx().signup.heading }}</h1>
        <p>{{ i18n.tx().signup.p }}</p>
        <form class="auth-form" #form="ngForm" (ngSubmit)="submit()">
          <input name="name" [placeholder]="i18n.tx().signup.firstName" [(ngModel)]="model.name" required>
          <input name="lastName" [placeholder]="i18n.tx().signup.lastName" [(ngModel)]="model.lastName" required>
          <app-phone-field name="phone" [placeholder]="i18n.tx().signup.phonePlaceholder" [required]="true" [(ngModel)]="model.phone"></app-phone-field>
          <input type="email" name="email" [placeholder]="i18n.tx().signup.email" [(ngModel)]="model.email" required>
          <input type="password" name="password" [placeholder]="i18n.tx().signup.password" [(ngModel)]="model.password" required>
          <button type="submit" class="primary-action" [disabled]="form.invalid || loading">{{ loading ? i18n.tx().signup.loading : i18n.tx().signup.btn }}</button>
          <p class="error" *ngIf="error">{{ error }}</p>
        </form>
        <a routerLink="/login">{{ i18n.tx().signup.loginLink }}</a>
      </div>
    </section>
  `
})
export class SignupPageComponent {
  model = { name: '', lastName: '', phone: '', email: '', password: '' };
  loading = false;
  error = '';

  constructor(private readonly auth: AuthService, private readonly router: Router, public readonly i18n: I18nService) {}

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
