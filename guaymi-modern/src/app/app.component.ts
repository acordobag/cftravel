import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { TravelStateService } from './travel-state.service';
import { AuthService } from './auth.service';
import { I18nService } from './i18n.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  menuOpen = false;

  constructor(
    public readonly state: TravelStateService,
    public readonly stateAuth: AuthService,
    public readonly i18n: I18nService,
  ) {}

  toggleMenu(): void { this.menuOpen = !this.menuOpen; }
  closeMenu(): void  { this.menuOpen = false; }
}
