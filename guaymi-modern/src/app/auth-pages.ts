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
      next: (response) => {
        if (response.user.mustChangePassword) {
          this.router.navigate(['/change-password']);
        } else {
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
          this.router.navigateByUrl(returnUrl || (this.auth.isPrivileged() ? '/admin' : '/account'));
        }
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
        <ng-container *ngIf="step === 'info'">
          <p class="eyebrow">{{ i18n.tx().signup.eyebrow }}</p>
          <h1>{{ i18n.tx().signup.heading }}</h1>
          <p>{{ i18n.tx().signup.p }}</p>
          <form class="auth-form" #infoForm="ngForm" (ngSubmit)="submitInfo(infoForm)">
            <input name="name" [placeholder]="i18n.tx().signup.firstName" [(ngModel)]="model.name" required>
            <input name="lastName" [placeholder]="i18n.tx().signup.lastName" [(ngModel)]="model.lastName" required>
            <app-phone-field name="phone" [placeholder]="i18n.tx().signup.phonePlaceholder" [required]="true" [(ngModel)]="model.phone"></app-phone-field>
            <input type="email" name="email" [placeholder]="i18n.tx().signup.email" [(ngModel)]="model.email" required>
            <button type="submit" class="primary-action" [disabled]="infoForm.invalid || loading">{{ loading ? i18n.tx().signup.loading : i18n.tx().signup.btn }}</button>
            <p class="error" *ngIf="error">{{ error }}</p>
          </form>
          <a routerLink="/login">{{ i18n.tx().signup.loginLink }}</a>
        </ng-container>

        <ng-container *ngIf="step === 'verify'">
          <p class="eyebrow">{{ i18n.tx().signup.verifyEyebrow }}</p>
          <h1>{{ i18n.tx().signup.verifyHeading }}</h1>
          <p>{{ i18n.tx().signup.verifyP }}</p>
          <form class="auth-form" #verifyForm="ngForm" (ngSubmit)="submitVerify(verifyForm)">
            <input name="code" [placeholder]="i18n.tx().signup.codePlaceholder" [(ngModel)]="verify.code" required maxlength="6" pattern="[0-9]{6}" inputmode="numeric">
            <input type="password" name="password" [placeholder]="i18n.tx().signup.password" [(ngModel)]="verify.password" required minlength="6">
            <button type="submit" class="primary-action" [disabled]="verifyForm.invalid || loading">{{ loading ? i18n.tx().signup.loading : i18n.tx().signup.verifyBtn }}</button>
            <p class="error" *ngIf="error">{{ error }}</p>
          </form>
          <button type="button" class="link-btn" [disabled]="loading" (click)="resendCode()">{{ i18n.tx().signup.resendCode }}</button>
        </ng-container>
      </div>
    </section>
  `
})
export class SignupPageComponent {
  step: 'info' | 'verify' = 'info';
  model = { name: '', lastName: '', phone: '', email: '' };
  verify = { code: '', password: '' };
  loading = false;
  error = '';

  constructor(private readonly auth: AuthService, private readonly router: Router, public readonly i18n: I18nService) {}

  submitInfo(form: any): void {
    if (form.invalid) return;
    this.loading = true;
    this.error = '';

    this.auth.signup(this.model).subscribe({
      next: () => {
        this.loading = false;
        this.step = 'verify';
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Could not create account.';
      }
    });
  }

  submitVerify(form: any): void {
    if (form.invalid) return;
    this.loading = true;
    this.error = '';

    this.auth.verifyEmail({ email: this.model.email, code: this.verify.code, password: this.verify.password }).subscribe({
      next: () => this.router.navigate(['/account']),
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Could not verify email.';
      }
    });
  }

  resendCode(): void {
    this.loading = true;
    this.error = '';

    this.auth.signup(this.model).subscribe({
      next: () => {
        this.loading = false;
        this.error = '';
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="auth-page">
      <div class="auth-panel">
        <p class="eyebrow">{{ i18n.tx().changePassword.eyebrow }}</p>
        <h1>{{ i18n.tx().changePassword.heading }}</h1>
        <p>{{ i18n.tx().changePassword.p }}</p>
        <form class="auth-form" #form="ngForm" (ngSubmit)="submit()">
          <input type="password" name="password" [placeholder]="i18n.tx().changePassword.newPassword" [(ngModel)]="password" required minlength="6">
          <input type="password" name="confirm" [placeholder]="i18n.tx().changePassword.confirmPassword" [(ngModel)]="confirm" required minlength="6">
          <p class="error" *ngIf="mismatch">{{ i18n.tx().changePassword.mismatch }}</p>
          <button type="submit" class="primary-action" [disabled]="form.invalid || loading">{{ loading ? i18n.tx().changePassword.loading : i18n.tx().changePassword.btn }}</button>
          <p class="error" *ngIf="error">{{ error }}</p>
        </form>
      </div>
    </section>
  `
})
export class ChangePasswordPageComponent {
  password = '';
  confirm = '';
  loading = false;
  error = '';
  mismatch = false;

  constructor(private readonly auth: AuthService, private readonly router: Router, public readonly i18n: I18nService) {}

  submit(): void {
    this.mismatch = false;
    if (this.password !== this.confirm) {
      this.mismatch = true;
      return;
    }
    this.loading = true;
    this.error = '';

    this.auth.changePassword({ password: this.password }).subscribe({
      next: () => {
        this.router.navigate([this.auth.isPrivileged() ? '/admin' : '/account']);
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Could not change password.';
      }
    });
  }
}
