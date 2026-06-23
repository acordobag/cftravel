export interface PlaceOption {
  id: number;
  name: string;
  zone: string;
  image: string;
  description: string;
  airportDistance: number;
  placeId?: string;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface CarType {
  id: number;
  name: string;
  description: string;
  capacity: number;
  extraPassengerCharge: number;
  maxExtraPassengers: number;
  active: boolean;
  sortOrder: number;
}

export interface ShuttleQuote {
  uid: number;
  departing: PlaceOption | null;
  destination: PlaceOption | null;
  departingSearch: string;
  destinationSearch: string;
  passengers: number;
  carTypeId: number | null;
  date: string;
  time: string;
  routeDistance: number;
  repositionDistance: number;
  vehicleSurcharge: number;
  total: number;
  isCalculating: boolean;
  rateError: string;
}

export interface Testimonial {
  id: number;
  name: string;
  location: string;
  route: string;
  rating: number;
  comment: string;
  active: boolean;
}

export interface ReservationPayload {
  user: {
    name: string;
    lastName: string;
    phone: string;
    email: string;
  };
  message: string;
  shuttles: Array<{
    departing: { id: number; name: string };
    destination: { id: number; name: string };
    date: string;
    persons: number;
    rate: number;
    distance: number;
  }>;
}

export interface ContactMethod {
  id?: number;
  type: 'phone' | 'whatsapp' | 'email' | 'social' | string;
  label: string;
  code?: string;
  number: string;
  href?: string;
  active?: boolean;
  sortOrder?: number;
}

export interface CompanyProfile {
  id?: number;
  name: string;
  email: string;
  tagline?: string;
  address?: string;
  website?: string;
  logo?: string;
  isDefault?: boolean;
  phones: ContactMethod[];
}
