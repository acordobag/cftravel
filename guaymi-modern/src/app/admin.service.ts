import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AuthService, AuthUser } from './auth.service';
import { CarType, Testimonial } from './models';
import { FixedRoutePrice, PriceRule, PricingConfig, ServicePricingRule } from './pricing.service';

import { environment } from '../environments/environment';
const API_URL = environment.apiUrl;

export interface AdminPlace {
  id?: number;
  name: string;
  description: string;
  image?: string;
  images?: Array<{ id: number; src: string; placeId: number }>;
}

export interface HeroImage {
  id?: number;
  src: string;
}

export interface AdminPhone {
  id?: number;
  type?: string;
  label?: string;
  code: string;
  number: string;
  href?: string;
  active?: boolean;
  sortOrder?: number;
  companyId?: number;
}

export interface AdminCompany {
  id?: number;
  name: string;
  email: string;
  tagline?: string;
  address?: string;
  website?: string;
  logo?: string;
  isDefault?: boolean;
  cancellationPolicyText?: string;
  phones?: AdminPhone[];
}

export const CONTACT_TYPE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'phone', label: 'Phone' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'Email' },
  { value: 'social', label: 'Social' }
];

export const USER_ROLE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'USER', label: 'USER' },
  { value: 'ADMIN', label: 'ADMIN' },
  { value: 'SUPER', label: 'SUPER' }
];

export interface AdminShuttle {
  id?: number;
  date: string;
  persons: number;
  departingId?: number;
  destinationId?: number;
  reservationId?: number;
  departing?: AdminPlace;
  destination?: AdminPlace;
}

export interface AdminReservation {
  id: number;
  message: string;
  companyNotes?: string;
  status?: string;
  user?: AuthUser;
  shuttles: AdminShuttle[];
  createdAt?: string;
}

export interface AdminMessage {
  id?: number;
  name: string;
  phone: string;
  email: string;
  text: string;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private readonly http: HttpClient, private readonly auth: AuthService) {}

  getPlaces() {
    return this.http.get<AdminPlace[]>(`${API_URL}/admin/place`, this.auth.authOptions());
  }

  createPlace(place: AdminPlace) {
    return this.http.post<AdminPlace>(`${API_URL}/admin/place`, {
      name: place.name,
      description: place.description,
      images: place.image ? [{ src: place.image }] : []
    }, this.auth.authOptions());
  }

  updatePlace(place: AdminPlace) {
    return this.http.put<AdminPlace>(`${API_URL}/admin/place/${place.id}`, place, this.auth.authOptions());
  }

  deletePlace(id: number) {
    return this.http.delete(`${API_URL}/admin/place/${id}`, this.auth.authOptions());
  }

  uploadImage(payload: { dataUrl: string; fileName: string }) {
    return this.http.post<{ src: string }>(`${API_URL}/admin/upload-image`, payload, this.auth.authOptions());
  }

  getTestimonials() {
    return this.http.get<Testimonial[]>(`${API_URL}/admin/testimonial`, this.auth.authOptions());
  }

  createTestimonial(testimonial: Testimonial) {
    return this.http.post<Testimonial>(`${API_URL}/admin/testimonial`, testimonial, this.auth.authOptions());
  }

  updateTestimonial(testimonial: Testimonial) {
    return this.http.put<Testimonial>(`${API_URL}/admin/testimonial/${testimonial.id}`, testimonial, this.auth.authOptions());
  }

  deleteTestimonial(id: number) {
    return this.http.delete(`${API_URL}/admin/testimonial/${id}`, this.auth.authOptions());
  }

  getHeroImages() {
    return this.http.get<HeroImage[]>(`${API_URL}/admin/hero-image`, this.auth.authOptions());
  }

  createHeroImage(image: HeroImage) {
    return this.http.post<HeroImage>(`${API_URL}/admin/hero-image`, image, this.auth.authOptions());
  }

  updateHeroImage(image: HeroImage) {
    return this.http.put<HeroImage>(`${API_URL}/admin/hero-image/${image.id}`, image, this.auth.authOptions());
  }

  deleteHeroImage(id: number) {
    return this.http.delete(`${API_URL}/admin/hero-image/${id}`, this.auth.authOptions());
  }

  getPricingConfig() {
    return this.http.get<PricingConfig>(`${API_URL}/admin/pricing`, this.auth.authOptions());
  }

  createPricingRule(rule: PriceRule) {
    return this.http.post<PriceRule>(`${API_URL}/admin/pricing/rule`, rule, this.auth.authOptions());
  }

  updatePricingRule(rule: PriceRule) {
    return this.http.put<PriceRule>(`${API_URL}/admin/pricing/rule/${rule.id}`, rule, this.auth.authOptions());
  }

  deletePricingRule(id: number) {
    return this.http.delete(`${API_URL}/admin/pricing/rule/${id}`, this.auth.authOptions());
  }

  createFixedRoutePrice(route: FixedRoutePrice) {
    return this.http.post<FixedRoutePrice>(`${API_URL}/admin/pricing/fixed-route`, route, this.auth.authOptions());
  }

  updateFixedRoutePrice(route: FixedRoutePrice) {
    return this.http.put<FixedRoutePrice>(`${API_URL}/admin/pricing/fixed-route/${route.id}`, route, this.auth.authOptions());
  }

  deleteFixedRoutePrice(id: number) {
    return this.http.delete(`${API_URL}/admin/pricing/fixed-route/${id}`, this.auth.authOptions());
  }

  createServicePricingRule(rule: ServicePricingRule) {
    return this.http.post<ServicePricingRule>(`${API_URL}/admin/pricing/service-rule`, rule, this.auth.authOptions());
  }

  updateServicePricingRule(rule: ServicePricingRule) {
    return this.http.put<ServicePricingRule>(`${API_URL}/admin/pricing/service-rule/${rule.id}`, rule, this.auth.authOptions());
  }

  deleteServicePricingRule(id: number) {
    return this.http.delete(`${API_URL}/admin/pricing/service-rule/${id}`, this.auth.authOptions());
  }

  getCarTypes() {
    return this.http.get<CarType[]>(`${API_URL}/admin/car-type`, this.auth.authOptions());
  }

  createCarType(ct: Partial<CarType>) {
    return this.http.post<CarType>(`${API_URL}/admin/car-type`, ct, this.auth.authOptions());
  }

  updateCarType(ct: CarType) {
    return this.http.put<CarType>(`${API_URL}/admin/car-type/${ct.id}`, ct, this.auth.authOptions());
  }

  deleteCarType(id: number) {
    return this.http.delete(`${API_URL}/admin/car-type/${id}`, this.auth.authOptions());
  }

  getReservations() {
    return this.http.get<AdminReservation[]>(`${API_URL}/admin/reservation`, this.auth.authOptions());
  }

  updateReservation(reservation: Pick<AdminReservation, 'id' | 'message' | 'companyNotes' | 'status'>) {
    return this.http.put<AdminReservation>(`${API_URL}/admin/reservation/${reservation.id}`, reservation, this.auth.authOptions());
  }

  confirmReservation(id: number, companyNotes: string) {
    return this.http.post<AdminReservation>(`${API_URL}/admin/reservation/${id}/confirm`, { companyNotes }, this.auth.authOptions());
  }

  deleteReservation(id: number) {
    return this.http.delete(`${API_URL}/admin/reservation/${id}`, this.auth.authOptions());
  }

  updateShuttle(shuttle: AdminShuttle) {
    return this.http.put<AdminShuttle>(`${API_URL}/admin/shuttle/${shuttle.id}`, shuttle, this.auth.authOptions());
  }

  deleteShuttle(id: number) {
    return this.http.delete(`${API_URL}/admin/shuttle/${id}`, this.auth.authOptions());
  }

  getCompanies() {
    return this.http.get<AdminCompany[]>(`${API_URL}/admin/company`, this.auth.authOptions());
  }

  createCompany(company: AdminCompany) {
    return this.http.post<AdminCompany>(`${API_URL}/admin/company`, company, this.auth.authOptions());
  }

  updateCompany(company: AdminCompany) {
    return this.http.put<AdminCompany>(`${API_URL}/admin/company/${company.id}`, company, this.auth.authOptions());
  }

  deleteCompany(id: number) {
    return this.http.delete(`${API_URL}/admin/company/${id}`, this.auth.authOptions());
  }

  createPhone(phone: AdminPhone) {
    return this.http.post<AdminPhone>(`${API_URL}/admin/phone`, phone, this.auth.authOptions());
  }

  updatePhone(phone: AdminPhone) {
    return this.http.put<AdminPhone>(`${API_URL}/admin/phone/${phone.id}`, phone, this.auth.authOptions());
  }

  deletePhone(id: number) {
    return this.http.delete(`${API_URL}/admin/phone/${id}`, this.auth.authOptions());
  }

  getMessages() {
    return this.http.get<AdminMessage[]>(`${API_URL}/admin/message`, this.auth.authOptions());
  }

  createMessage(message: AdminMessage) {
    return this.http.post<AdminMessage>(`${API_URL}/admin/message`, message, this.auth.authOptions());
  }

  updateMessage(message: AdminMessage) {
    return this.http.put<AdminMessage>(`${API_URL}/admin/message/${message.id}`, message, this.auth.authOptions());
  }

  deleteMessage(id: number) {
    return this.http.delete(`${API_URL}/admin/message/${id}`, this.auth.authOptions());
  }

  getUsers() {
    return this.http.get<AuthUser[]>(`${API_URL}/admin/users`, this.auth.authOptions());
  }

  createPrivilegedUser(user: Partial<AuthUser> & { password: string }) {
    return this.http.post<AuthUser>(`${API_URL}/admin/users`, user, this.auth.authOptions());
  }

  updateUser(user: Partial<AuthUser> & { id: number; password?: string }) {
    return this.http.put<AuthUser>(`${API_URL}/admin/users/${user.id}`, user, this.auth.authOptions());
  }
}
