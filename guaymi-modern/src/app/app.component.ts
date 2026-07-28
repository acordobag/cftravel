import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';

import { TravelStateService } from './travel-state.service';
import { AuthService } from './auth.service';
import { I18nService } from './i18n.service';
import { SeoService } from './seo.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {
  menuOpen = false;

  constructor(
    public readonly state: TravelStateService,
    public readonly stateAuth: AuthService,
    public readonly i18n: I18nService,
    private readonly seo: SeoService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd)
    ).subscribe((e) => {
      const path = e.urlAfterRedirects.split('?')[0];
      this.seo.updateForRoute(path);
    });
  }

  toggleMenu(): void { this.menuOpen = !this.menuOpen; }
  closeMenu(): void  { this.menuOpen = false; }
}
