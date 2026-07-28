import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

interface SeoConfig {
  title: string;
  description: string;
  canonicalPath?: string;
}

const BASE_TITLE = 'CR Travel Service';
const BASE_URL = 'https://crtravelservice.com';

const ROUTE_META: Record<string, SeoConfig> = {
  '/': {
    title: `Private Shuttle Transfers in Costa Rica | ${BASE_TITLE}`,
    description: 'Book private airport shuttles, hotel-to-hotel transfers, and custom routes across Costa Rica. Fixed pricing, no shared rides, door-to-door service from SJO and LIR airports.',
    canonicalPath: '/'
  },
  '/home': {
    title: `Private Shuttle Transfers in Costa Rica | ${BASE_TITLE}`,
    description: 'Book private airport shuttles, hotel-to-hotel transfers, and custom routes across Costa Rica. Fixed pricing, no shared rides, door-to-door service from SJO and LIR airports.',
    canonicalPath: '/'
  },
  '/services': {
    title: `Private Transportation Services | ${BASE_TITLE}`,
    description: 'Explore private airport transfers, hotel transportation and custom shuttle services throughout Costa Rica.',
    canonicalPath: '/services'
  },
  '/destinations': {
    title: `Costa Rica Destinations | ${BASE_TITLE}`,
    description: 'Discover Costa Rica destinations and arrange private door-to-door transportation for your complete itinerary.',
    canonicalPath: '/destinations'
  },
  '/fleet': {
    title: `Private Shuttle Fleet | ${BASE_TITLE}`,
    description: 'Travel comfortably across Costa Rica in a modern private shuttle operated by an experienced local driver.',
    canonicalPath: '/fleet'
  },
  '/testimonials': {
    title: `Guest Reviews | ${BASE_TITLE}`,
    description: 'Read what travelers say about their private transportation experience with CR Travel Service.',
    canonicalPath: '/testimonials'
  },
  '/about-us': {
    title: `About Us | ${BASE_TITLE}`,
    description: 'Meet CR Travel Service, a Costa Rican private transportation company focused on reliable, personal service.',
    canonicalPath: '/about-us'
  },
  '/contact-us': {
    title: `Contact Us | ${BASE_TITLE}`,
    description: 'Contact CR Travel Service to plan private airport transfers and custom transportation across Costa Rica.',
    canonicalPath: '/contact-us'
  },
  '/reservation': {
    title: `Book a Shuttle Transfer | ${BASE_TITLE}`,
    description: 'Reserve your private shuttle transfer across Costa Rica. Choose your pickup, destination, date and passengers. Instant price estimate - no surprises.',
    canonicalPath: '/reservation'
  },
  '/account': {
    title: `My Account | ${BASE_TITLE}`,
    description: 'Manage your CR Travel Service account and view your shuttle reservations.',
    canonicalPath: '/account'
  },
  '/policy': {
    title: `Booking & Cancellation Policy | ${BASE_TITLE}`,
    description: 'Understand the booking, cancellation and modification policy for CR Travel Service private shuttle reservations in Costa Rica.',
    canonicalPath: '/policy'
  },
  '/login': {
    title: `Sign In | ${BASE_TITLE}`,
    description: 'Sign in to your CR Travel Service account to manage bookings and reservations.',
    canonicalPath: '/login'
  },
  '/signup': {
    title: `Create Account | ${BASE_TITLE}`,
    description: 'Create a CR Travel Service account to book private shuttle transfers in Costa Rica.',
    canonicalPath: '/signup'
  }
};

const DESTINATION_TITLES: Record<string, string> = {
  'poas-volcano': 'Poas Volcano',
  'arenal-volcano': 'Arenal Volcano',
  'manuel-antonio': 'Manuel Antonio',
  'uvita-bahia-ballena': 'Uvita and Bahia Ballena',
  'puerto-viejo': 'Puerto Viejo',
  'north-pacific-guanacaste': 'North Pacific and Guanacaste',
  'playa-conchal': 'Playa Conchal',
  tamarindo: 'Tamarindo',
  'jaco-beach': 'Jaco Beach',
  monteverde: 'Monteverde',
  'san-gerardo-de-dota': 'San Gerardo de Dota'
};

@Injectable({ providedIn: 'root' })
export class SeoService {
  constructor(private readonly title: Title, private readonly meta: Meta) {}

  updateForRoute(path: string): void {
    const destinationSlug = path.startsWith('/destinations/')
      ? path.slice('/destinations/'.length)
      : '';
    const destinationTitle = DESTINATION_TITLES[destinationSlug];
    const config = destinationTitle
      ? {
          title: `${destinationTitle} Private Transfers | ${BASE_TITLE}`,
          description: `Plan your visit to ${destinationTitle} with reliable private transportation and local service from CR Travel Service.`,
          canonicalPath: path
        }
      : ROUTE_META[path] || ROUTE_META['/'];

    this.apply(config);
  }

  private apply(config: SeoConfig): void {
    this.title.setTitle(config.title);
    this.meta.updateTag({ name: 'description', content: config.description });
    this.meta.updateTag({ property: 'og:title', content: config.title });
    this.meta.updateTag({ property: 'og:description', content: config.description });

    if (config.canonicalPath) {
      const canonical = `${BASE_URL}${config.canonicalPath}`;
      this.meta.updateTag({ property: 'og:url', content: canonical });
      this.updateCanonical(canonical);
    }
  }

  private updateCanonical(url: string): void {
    const existing = document.querySelector('link[rel="canonical"]');
    if (existing) {
      existing.setAttribute('href', url);
    }
  }
}
