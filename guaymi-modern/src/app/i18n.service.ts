import { Injectable, computed, signal } from '@angular/core';

export type Lang = 'en' | 'es';

const EN = {
  lang: 'en' as Lang,
  langToggle: 'Español',

  topStrip: { p1: 'Private Costa Rica transfers', p2: 'Airport, hotel-to-hotel, custom stops' },
  whatsapp: 'WhatsApp quote',

  nav: {
    book: 'Book', services: 'Services', destinations: 'Destinations', fleet: 'Fleet',
    testimonials: 'Testimonials', about: 'About', contact: 'Contact',
    account: 'Account', admin: 'Admin', login: 'Login', logout: 'Logout', reserve: 'Reserve now', policy: 'Booking policy',
  },

  booking: {
    eyebrow: 'Private shuttle booking',
    heading: 'Plan your Costa Rica transfer',
    compactPrefix: 'Transfer',
    departing: 'Departing from',
    destination: 'Going to',
    passengers: 'Passengers',
    date: 'Pickup date',
    time: 'Pickup time',
    estimatedFare: 'Estimated fare',
    calculatingRoute: 'Calculating route',
    routeLabel: 'Route',
    operationsLabel: 'Operations distance',
    totalLabel: 'Total',
    continueBtn: 'Continue booking',
    vehicleType: 'Vehicle type',
    anyVehicle: 'Any vehicle',
    upTo: 'Up to',
    pax: 'passengers',
    extraPax: 'extra pax',
    extraPaxLabel: 'Extra passenger charge',
    addChildren: 'Traveling with children?',
    hideChildren: 'Hide children section',
    infant: 'Infant',
    toddler: 'Toddler',
    preschool: 'Preschooler',
    child: 'Child',
  },

  hero: {
    eyebrow: 'Costa Rica private transportation',
    h1: 'CR Travel Service',
    p: 'Book a private shuttle with route-aware pricing, direct pickups, and flexible stops for real travel days.',
    cta: 'Book your ride',
    ctaLink: 'Explore routes',
  },

  promises: [
    { title: 'Door-to-door', text: 'Hotel, villa, airport and marina pickups' },
    { title: 'Stops by request', text: 'Groceries, lunch, viewpoints and comfort breaks' },
    { title: 'Private vehicles', text: 'Space planned around passengers and luggage' },
  ],

  assurance: ['Licensed drivers', 'Private vehicles', 'No shared rides', 'Direct route', 'Real-time updates', 'Custom stops'],

  quickGrid: [
    { label: 'Services', text: 'Airport, hotel-to-hotel, multi-stop routes', path: '/services' },
    { label: 'Destinations', text: 'Explore popular Costa Rica transfers', path: '/destinations' },
    { label: 'Fleet', text: 'Private shuttle fleet', path: '/fleet' },
    { label: 'Testimonials', text: 'Traveler notes from the road', path: '/testimonials' },
  ],

  howItWorks: { eyebrow: 'How it works', heading: 'Book without guessing the route' },

  bookingSteps: [
    { step: '01', title: 'Pick your route', text: 'Enter your departing location and destination. The form calculates real driving distance on the spot.' },
    { step: '02', title: 'Review the fare', text: 'The estimate reflects route distance and operations. No hidden surge pricing or per-person multipliers.' },
    { step: '03', title: 'Send the request', text: 'Add passenger details and any notes. We confirm the booking and handle vehicle assignment before travel.' },
  ],

  servicesSection: { eyebrow: 'Services', heading: 'Built around private travel days' },

  services: [
    { icon: 'AIR', title: 'Airport transfer', text: 'Flight-aware pickups and drop-offs at SJO and LIR. The driver adjusts for your actual landing time.' },
    { icon: 'H2H', title: 'Hotel-to-hotel', text: 'Comfortable point-to-point transfers between lodging anywhere in Costa Rica.' },
    { icon: 'ADD', title: 'Custom stops', text: 'Add grocery runs, scenic viewpoints, lunch stops, or mid-route drop-offs to any transfer.' },
  ],

  confidenceSection: { eyebrow: 'Travel with confidence', heading: 'Built for real Costa Rica travel days' },

  confidenceItems: [
    { icon: 'SAFE', title: 'Licensed and insured', text: 'All vehicles are properly licensed for private transport operations in Costa Rica.' },
    { icon: 'TIME', title: 'On time, every route', text: 'Pickup times are based on your actual flight data or confirmed schedule.' },
    { icon: 'CHAT', title: 'Direct communication', text: 'Contact your driver directly before and during the trip. No call center between you and the road.' },
    { icon: 'VIP', title: 'Private, never shared', text: 'Your vehicle is for your group only. No stops for other passengers, no shared ride delays.' },
    { icon: 'PRICE', title: 'Upfront pricing', text: 'The rate shown in the booking card is the rate on the invoice. No surprises at pickup.' },
    { icon: 'FAMILY', title: 'Family and group ready', text: 'Vehicles sized for families, surf groups, corporate teams, or solo travelers with gear.' },
  ],

  fleetSection: { eyebrow: 'Fleet', heading: 'One modern private shuttle, planned carefully for every route' },

  fleetHighlights: [
    { title: 'Air-conditioned comfort', text: 'Climate-controlled throughout every route, regardless of road conditions or elevation changes.' },
    { title: 'Luggage capacity', text: 'Full baggage for the whole group fits without needing to split into multiple vehicles.' },
    { title: 'Private by design', text: 'The vehicle is reserved for your group only. No shared rides, no unplanned stops.' },
  ],

  routeHighlights: [
    { value: '50+', label: 'Active routes' },
    { value: '100%', label: 'Private transfers' },
    { value: 'SJO', label: 'Primary airport' },
  ],

  trustSection: {
    eyebrow: 'Why choose CR Travel Service',
    heading: 'Clear transfer planning before the road begins',
    p: 'Compare your route, see the estimated fare, and send one clean booking request for single or multi-transfer itineraries.',
  },

  trustItems: [
    { value: '3+', label: 'Years of private routes' },
    { value: '100%', label: 'Private transfers' },
    { value: '5★', label: 'Average rating' },
    { value: 'SJO & LIR', label: 'Airport coverage' },
  ],

  destSection: { eyebrow: 'Popular routes', heading: 'Costa Rica destinations' },

  splitCta: {
    eyebrow: 'Private routes, simple planning',
    heading: 'Airport transfers, beach transfers, and custom travel days in one flow.',
    btn: 'Reserve now',
  },

  experienceSection: {
    eyebrow: 'Ride experience',
    heading: 'Private vans, planned stops, smoother handoffs',
    p: 'Long routes in Costa Rica can include mountain roads, ferry timing, beach traffic, and airport deadlines. The booking flow keeps the operational distance visible so pricing is easier to understand.',
    items: ['Air-conditioned vehicles', 'Hotel and villa pickups', 'Custom stops by request'],
  },

  testimonialSection: { eyebrow: 'Testimonials', heading: 'Traveler notes from the road' },

  finalCta: {
    eyebrow: 'Ready when your route is',
    heading: 'Build your private transfer request in minutes',
    btn: 'Start with your route',
  },

  servicesPage: { eyebrow: 'Private shuttle options', title: 'Services', text: 'Focused transport products for common Costa Rica travel days.' },
  fleetPage: { eyebrow: 'Comfort on the road', title: 'Fleet', text: 'Modern private shuttle transportation planned around passengers, luggage, pickup locations, and long Costa Rica routes.' },
  destPage: { eyebrow: 'Popular routes', title: 'Destinations', text: 'Private transfers to airports, beaches, volcano towns, and cloud forest stays.' },
  testimonialsPage: { eyebrow: 'Traveler notes', title: 'Testimonials', text: 'Real feedback from travelers who used CR Travel Service.' },

  aboutPage: {
    eyebrow: 'Local operations', title: 'About', text: 'CR Travel Service is built around private shuttle planning for Costa Rica routes.',
    rideEyebrow: 'Ride experience', rideHeading: 'Private vans, planned stops, smoother handoffs',
    rideP: 'Long routes can include mountain roads, beach traffic, ferry timing, and airport deadlines. The quote keeps route and operations distance visible.',
    rideItems: ['Air-conditioned vehicles', 'Hotel and villa pickups', 'Custom stops by request'],
  },

  contactPage: {
    eyebrow: 'Talk to us', title: 'Contact', text: 'Share your route, timing, and passenger details so we can confirm availability.',
    formEyebrow: 'Contact', formHeading: 'Tell us about your transfer',
    formP: 'Use the form and we will confirm vehicle availability, pickup timing, and custom stops.',
  },

  reservation: {
    eyebrow: 'Booking request',
    heading: 'Review your private transfer',
    largeParty: 'Larger parties may require a custom vehicle assignment. We will confirm the best option before payment.',
    removeTransfer: 'Remove transfer',
    addTransfer: 'Add another transfer',
    travelerEyebrow: 'Traveler details',
    travelerHeading: 'Contact information',
    firstName: 'First name',
    lastName: 'Last name',
    notes: 'Trip notes',
    sendBtn: 'Send booking request',
    successEyebrow: 'Booking received',
    successHeading: 'Your transfer request is on its way!',
    successMsg: 'We received your booking and will confirm the driver, vehicle, and pickup details shortly. Check your email for confirmation and account access.',
    successSteps: [
      '📧 Check your email — we sent a confirmation with your reservation details',
      '🔐 Your account is ready — log in to track your booking and receive trip updates',
      '📱 Our team will contact you to confirm driver and vehicle assignment',
    ],
    successAccountBtn: 'View my reservations',
    transfer: 'transfer',
    transfers: 'transfers',
  },

  footer: {
    contact: 'Contact',
    explore: 'Explore',
    popularRoutes: 'Popular Routes',
    routes: ['SJO Airport to La Fortuna', 'SJO Airport to Jaco Beach', 'Jaco Beach to Manuel Antonio', 'Liberia routes by request'],
  },

  login: {
    eyebrow: 'Privileged access',
    heading: 'Login',
    p: 'Access your travel account or the CR Travel Service maintenance dashboard.',
    email: 'Email',
    password: 'Password',
    btn: 'Login',
    loading: 'Signing in...',
    signupLink: 'Create a customer account',
  },

  signup: {
    eyebrow: 'Customer account',
    heading: 'Sign up',
    p: 'Create a regular customer account. Admin users are created only by the super user.',
    firstName: 'First name',
    lastName: 'Last name',
    phonePlaceholder: '8888 8888',
    email: 'Email',
    password: 'Choose a password',
    btn: 'Send verification code',
    loading: 'Sending...',
    loginLink: 'Already have an account?',
    verifyEyebrow: 'Verify your email',
    verifyHeading: 'Check your inbox',
    verifyP: 'We sent a 6-digit code to your email. Enter it below and choose a password to complete your registration.',
    codePlaceholder: '6-digit code',
    verifyBtn: 'Create account',
    resendCode: 'Resend code',
  },

  changePassword: {
    eyebrow: 'Security',
    heading: 'Set your password',
    p: 'Your account was created automatically. Please set a password to continue.',
    newPassword: 'New password',
    confirmPassword: 'Confirm password',
    mismatch: 'Passwords do not match.',
    btn: 'Save password',
    loading: 'Saving...',
  },

  account: {
    eyebrow: 'Customer account',
    heading: 'My travel dashboard',
    p: 'Update your details, review booking requests, and read internal trip messages.',
    newBooking: 'New booking',
    tabProfile: 'Profile',
    tabReservations: 'Reservations',
    tabMessages: 'Messages',
    tabReview: 'Leave a review',
    profileSignedIn: 'Signed in as',
    profileEyebrow: 'Profile',
    profileHeading: 'Contact details',
    firstName: 'First name',
    lastName: 'Last name',
    emailDisabled: 'Email',
    newPassword: 'New password (optional)',
    saveBtn: 'Save profile',
    saving: 'Saving...',
    noPhone: 'No phone saved',
    bookingsEyebrow: 'Bookings',
    bookingsHeading: 'My reservations',
    noReservations: 'No reservations yet',
    noReservationsP: 'Your booking requests will appear here after you send them.',
    firstBooking: 'Create first booking',
    messagesEyebrow: 'Internal messages',
    messagesHeading: 'Trip updates',
    reviewEyebrow: 'Share your experience',
    reviewHeading: 'Leave a review',
    reviewP: 'Your review will be visible on the site after our team approves it.',
    reviewName: 'Your name',
    reviewLocation: 'Where are you from?',
    reviewRoute: 'Route you traveled',
    reviewRating: 'Rating',
    reviewComment: 'Your review',
    reviewRequired: 'required',
    reviewLockedTip: 'Available after you complete a trip',
    reviewBtn: 'Submit review',
    reviewLoading: 'Sending...',
    reviewSentEyebrow: 'Thank you!',
    reviewSentHeading: 'Your review has been submitted',
    reviewSentP: 'It will appear on the site once our team reviews it.',
    reviewSentBtn: 'Leave another review',
    reservationLabel: 'Reservation',
    passenger: 'passenger',
    passengers: 'passengers',
    confirmedBadge: 'Confirmed',
    cancelBtn: 'Cancel reservation',
    cancelling: 'Cancelling...',
    cancelledBadge: 'Cancelled',
    cancelSuccess: 'Your reservation has been cancelled.',
    cancelModalTitle: 'Cancel reservation',
    cancelModalLoading: 'Checking cancellation policy...',
    cancelModalFeeMsg: 'A cancellation fee of ${fee} ({pct}% of the total) will apply.',
    cancelModalTooLate: 'Cancellation is not possible within {hours} hours of the reservation.',
    cancelModalClose: 'Keep reservation',
    cancelModalConfirm: 'Confirm cancellation',
  },
};

const ES: typeof EN = {
  lang: 'es' as Lang,
  langToggle: 'English',

  topStrip: { p1: 'Traslados privados en Costa Rica', p2: 'Aeropuerto, hotel a hotel, paradas personalizadas' },
  whatsapp: 'Cotización por WhatsApp',

  nav: {
    book: 'Reservar', services: 'Servicios', destinations: 'Destinos', fleet: 'Flota',
    testimonials: 'Testimonios', about: 'Nosotros', contact: 'Contacto',
    account: 'Mi cuenta', admin: 'Admin', login: 'Ingresar', logout: 'Salir', reserve: 'Reservar ahora', policy: 'Política de reservas',
  },

  booking: {
    eyebrow: 'Shuttle privado',
    heading: 'Planifica tu traslado en Costa Rica',
    compactPrefix: 'Traslado',
    departing: 'Punto de partida',
    destination: 'Destino',
    passengers: 'Pasajeros',
    date: 'Fecha de recogida',
    time: 'Hora de recogida',
    estimatedFare: 'Tarifa estimada',
    calculatingRoute: 'Calculando ruta',
    routeLabel: 'Ruta',
    operationsLabel: 'Distancia operativa',
    totalLabel: 'Total',
    continueBtn: 'Continuar reserva',
    vehicleType: 'Tipo de vehículo',
    anyVehicle: 'Cualquier vehículo',
    upTo: 'Hasta',
    pax: 'pasajeros',
    extraPax: 'pax extra',
    extraPaxLabel: 'Cargo por pasajero extra',
    addChildren: '¿Viajan niños?',
    hideChildren: 'Ocultar sección de niños',
    infant: 'Bebé',
    toddler: 'Niño pequeño',
    preschool: 'Preescolar',
    child: 'Niño',
  },

  hero: {
    eyebrow: 'Transporte privado en Costa Rica',
    h1: 'CR Travel Service',
    p: 'Reserva un shuttle privado con tarifas basadas en ruta, recogidas directas y paradas flexibles.',
    cta: 'Reserva tu traslado',
    ctaLink: 'Explorar rutas',
  },

  promises: [
    { title: 'Puerta a puerta', text: 'Recogidas en hoteles, villas, aeropuertos y marinas' },
    { title: 'Paradas a solicitud', text: 'Supermercados, almuerzos, miradores y descansos' },
    { title: 'Vehículos privados', text: 'Espacio planificado para pasajeros y equipaje' },
  ],

  assurance: ['Conductores licenciados', 'Vehículos privados', 'Sin viajes compartidos', 'Ruta directa', 'Actualizaciones en tiempo real', 'Paradas personalizadas'],

  quickGrid: [
    { label: 'Servicios', text: 'Aeropuerto, hotel a hotel, rutas con paradas', path: '/services' },
    { label: 'Destinos', text: 'Explora los traslados más populares en Costa Rica', path: '/destinations' },
    { label: 'Flota', text: 'Flota de shuttles privados', path: '/fleet' },
    { label: 'Testimonios', text: 'Opiniones de viajeros', path: '/testimonials' },
  ],

  howItWorks: { eyebrow: 'Cómo funciona', heading: 'Reserva sin adivinar la ruta' },

  bookingSteps: [
    { step: '01', title: 'Elige tu ruta', text: 'Ingresa tu punto de partida y destino. El formulario calcula la distancia real de conducción al instante.' },
    { step: '02', title: 'Revisa la tarifa', text: 'La estimación refleja la distancia de ruta y operación. Sin precios ocultos ni multiplicadores por persona.' },
    { step: '03', title: 'Envía la solicitud', text: 'Agrega los datos de pasajeros y cualquier nota. Confirmamos la reserva y asignamos el vehículo antes del viaje.' },
  ],

  servicesSection: { eyebrow: 'Servicios', heading: 'Diseñados para días de viaje privado' },

  services: [
    { icon: 'AIR', title: 'Traslado al aeropuerto', text: 'Recogidas y entregas en SJO y LIR con seguimiento de vuelo. El conductor se ajusta a tu hora de llegada real.' },
    { icon: 'H2H', title: 'Hotel a hotel', text: 'Traslados cómodos de punto a punto entre alojamientos en cualquier parte de Costa Rica.' },
    { icon: 'ADD', title: 'Paradas personalizadas', text: 'Agrega visitas al supermercado, miradores, almuerzos o paradas en el camino a cualquier traslado.' },
  ],

  confidenceSection: { eyebrow: 'Viaja con confianza', heading: 'Hecho para días de viaje real en Costa Rica' },

  confidenceItems: [
    { icon: 'SAFE', title: 'Licenciados y asegurados', text: 'Todos los vehículos están debidamente habilitados para operaciones de transporte privado en Costa Rica.' },
    { icon: 'TIME', title: 'Puntuales en cada ruta', text: 'Las horas de recogida se basan en tus datos de vuelo reales o tu horario confirmado.' },
    { icon: 'CHAT', title: 'Comunicación directa', text: 'Comunícate con tu conductor antes y durante el viaje. Sin intermediarios entre tú y la carretera.' },
    { icon: 'VIP', title: 'Privado, nunca compartido', text: 'Tu vehículo es exclusivo para tu grupo. Sin paradas para otros pasajeros ni retrasos.' },
    { icon: 'PRICE', title: 'Precio transparente', text: 'La tarifa mostrada en la reserva es la tarifa de la factura. Sin sorpresas al recoger.' },
    { icon: 'FAMILY', title: 'Para familias y grupos', text: 'Vehículos adecuados para familias, grupos de surf, equipos corporativos o viajeros solos con equipaje.' },
  ],

  fleetSection: { eyebrow: 'Flota', heading: 'Un shuttle privado moderno, planificado cuidadosamente para cada ruta' },

  fleetHighlights: [
    { title: 'Confort con aire acondicionado', text: 'Climatizado en toda la ruta, sin importar las condiciones de la carretera o la elevación.' },
    { title: 'Capacidad de equipaje', text: 'Todo el equipaje del grupo cabe sin necesidad de dividirse en varios vehículos.' },
    { title: 'Privado por diseño', text: 'El vehículo está reservado solo para tu grupo. Sin viajes compartidos ni paradas no planificadas.' },
  ],

  routeHighlights: [
    { value: '50+', label: 'Rutas activas' },
    { value: '100%', label: 'Traslados privados' },
    { value: 'SJO', label: 'Aeropuerto principal' },
  ],

  trustSection: {
    eyebrow: 'Por qué elegir CR Travel Service',
    heading: 'Planificación clara del traslado antes de salir',
    p: 'Compara tu ruta, ve la tarifa estimada y envía una solicitud de reserva limpia para itinerarios simples o múltiples.',
  },

  trustItems: [
    { value: '3+', label: 'Años de rutas privadas' },
    { value: '100%', label: 'Traslados privados' },
    { value: '5★', label: 'Calificación promedio' },
    { value: 'SJO & LIR', label: 'Cobertura aeroportuaria' },
  ],

  destSection: { eyebrow: 'Rutas populares', heading: 'Destinos en Costa Rica' },

  splitCta: {
    eyebrow: 'Rutas privadas, planificación simple',
    heading: 'Traslados al aeropuerto, a la playa y días de viaje personalizados en un solo flujo.',
    btn: 'Reservar ahora',
  },

  experienceSection: {
    eyebrow: 'Experiencia de viaje',
    heading: 'Vans privadas, paradas planificadas, traslados más fluidos',
    p: 'Las rutas largas en Costa Rica pueden incluir caminos de montaña, ferris, tráfico en la playa y plazos aeroportuarios. El flujo de reserva mantiene visible la distancia operativa para que el precio sea más fácil de entender.',
    items: ['Vehículos con aire acondicionado', 'Recogidas en hoteles y villas', 'Paradas personalizadas a solicitud'],
  },

  testimonialSection: { eyebrow: 'Testimonios', heading: 'Opiniones de viajeros' },

  finalCta: {
    eyebrow: 'Listo cuando tu ruta lo esté',
    heading: 'Crea tu solicitud de traslado privado en minutos',
    btn: 'Empieza con tu ruta',
  },

  servicesPage: { eyebrow: 'Opciones de shuttle privado', title: 'Servicios', text: 'Productos de transporte enfocados para los días de viaje más comunes en Costa Rica.' },
  fleetPage: { eyebrow: 'Confort en la carretera', title: 'Flota', text: 'Transporte privado moderno planificado para pasajeros, equipaje y largas rutas en Costa Rica.' },
  destPage: { eyebrow: 'Rutas populares', title: 'Destinos', text: 'Traslados privados a aeropuertos, playas, pueblos volcánicos y bosques nubosos.' },
  testimonialsPage: { eyebrow: 'Opiniones de viajeros', title: 'Testimonios', text: 'Opiniones reales de viajeros que usaron CR Travel Service.' },

  aboutPage: {
    eyebrow: 'Operaciones locales', title: 'Nosotros', text: 'CR Travel Service está diseñado para la planificación de shuttles privados en rutas de Costa Rica.',
    rideEyebrow: 'Experiencia de viaje', rideHeading: 'Vans privadas, paradas planificadas, traslados más fluidos',
    rideP: 'Las rutas largas pueden incluir caminos de montaña, tráfico en playa, ferris y plazos aeroportuarios. La cotización mantiene visible la distancia de ruta y operación.',
    rideItems: ['Vehículos con aire acondicionado', 'Recogidas en hoteles y villas', 'Paradas personalizadas a solicitud'],
  },

  contactPage: {
    eyebrow: 'Contáctanos', title: 'Contacto', text: 'Comparte tu ruta, horario y detalles de pasajeros para confirmar disponibilidad.',
    formEyebrow: 'Contacto', formHeading: 'Cuéntanos sobre tu traslado',
    formP: 'Usa el formulario y confirmamos disponibilidad de vehículo, horario de recogida y paradas personalizadas.',
  },

  reservation: {
    eyebrow: 'Solicitud de reserva',
    heading: 'Revisa tu traslado privado',
    largeParty: 'Los grupos grandes pueden requerir asignación personalizada de vehículo. Lo confirmamos antes del pago.',
    removeTransfer: 'Eliminar traslado',
    addTransfer: 'Agregar otro traslado',
    travelerEyebrow: 'Datos del viajero',
    travelerHeading: 'Información de contacto',
    firstName: 'Nombre',
    lastName: 'Apellido',
    notes: 'Notas del viaje',
    sendBtn: 'Enviar solicitud de reserva',
    successEyebrow: 'Reserva recibida',
    successHeading: '¡Tu solicitud de traslado está en camino!',
    successMsg: 'Recibimos tu reserva y confirmaremos el conductor, vehículo y detalles de recogida en breve. Revisa tu correo para la confirmación y acceso a tu cuenta.',
    successSteps: [
      '📧 Revisa tu correo — enviamos una confirmación con los detalles de tu reserva',
      '🔐 Tu cuenta está lista — inicia sesión para seguir tu reserva y recibir actualizaciones',
      '📱 Nuestro equipo te contactará para confirmar el conductor y vehículo asignado',
    ],
    successAccountBtn: 'Ver mis reservas',
    transfer: 'traslado',
    transfers: 'traslados',
  },

  footer: {
    contact: 'Contacto',
    explore: 'Explorar',
    popularRoutes: 'Rutas Populares',
    routes: ['SJO Aeropuerto a La Fortuna', 'SJO Aeropuerto a Playa Jacó', 'Jacó a Manuel Antonio', 'Rutas por Liberia a solicitud'],
  },

  login: {
    eyebrow: 'Acceso privilegiado',
    heading: 'Ingresar',
    p: 'Accede a tu cuenta de viajes o al panel de administración de CR Travel Service.',
    email: 'Correo electrónico',
    password: 'Contraseña',
    btn: 'Ingresar',
    loading: 'Iniciando sesión...',
    signupLink: 'Crear una cuenta de cliente',
  },

  signup: {
    eyebrow: 'Cuenta de cliente',
    heading: 'Registrarse',
    p: 'Crea una cuenta de cliente regular. Los usuarios administradores solo son creados por el super usuario.',
    firstName: 'Nombre',
    lastName: 'Apellido',
    phonePlaceholder: '8888 8888',
    email: 'Correo electrónico',
    password: 'Elige una contraseña',
    btn: 'Enviar código de verificación',
    loading: 'Enviando...',
    loginLink: '¿Ya tienes una cuenta?',
    verifyEyebrow: 'Verifica tu correo',
    verifyHeading: 'Revisa tu bandeja de entrada',
    verifyP: 'Enviamos un código de 6 dígitos a tu correo. Ingrésalo y elige una contraseña para completar tu registro.',
    codePlaceholder: 'Código de 6 dígitos',
    verifyBtn: 'Crear cuenta',
    resendCode: 'Reenviar código',
  },

  changePassword: {
    eyebrow: 'Seguridad',
    heading: 'Establece tu contraseña',
    p: 'Tu cuenta fue creada automáticamente. Por favor establece una contraseña para continuar.',
    newPassword: 'Nueva contraseña',
    confirmPassword: 'Confirmar contraseña',
    mismatch: 'Las contraseñas no coinciden.',
    btn: 'Guardar contraseña',
    loading: 'Guardando...',
  },

  account: {
    eyebrow: 'Cuenta de cliente',
    heading: 'Mi panel de viajes',
    p: 'Actualiza tus datos, revisa solicitudes de reserva y lee mensajes internos del viaje.',
    newBooking: 'Nueva reserva',
    tabProfile: 'Perfil',
    tabReservations: 'Reservas',
    tabMessages: 'Mensajes',
    tabReview: 'Dejar una opinión',
    profileSignedIn: 'Sesión iniciada como',
    profileEyebrow: 'Perfil',
    profileHeading: 'Datos de contacto',
    firstName: 'Nombre',
    lastName: 'Apellido',
    emailDisabled: 'Correo electrónico',
    newPassword: 'Nueva contraseña (opcional)',
    saveBtn: 'Guardar perfil',
    saving: 'Guardando...',
    noPhone: 'Sin teléfono guardado',
    bookingsEyebrow: 'Reservas',
    bookingsHeading: 'Mis reservas',
    noReservations: 'Aún no tienes reservas',
    noReservationsP: 'Tus solicitudes de reserva aparecerán aquí después de enviarlas.',
    firstBooking: 'Crear primera reserva',
    messagesEyebrow: 'Mensajes internos',
    messagesHeading: 'Actualizaciones del viaje',
    reviewEyebrow: 'Comparte tu experiencia',
    reviewHeading: 'Dejar una opinión',
    reviewP: 'Tu opinión será visible en el sitio después de que nuestro equipo la apruebe.',
    reviewName: 'Tu nombre',
    reviewLocation: '¿De dónde eres?',
    reviewRoute: 'Ruta que viajaste',
    reviewRating: 'Calificación',
    reviewComment: 'Tu opinión',
    reviewRequired: 'requerido',
    reviewLockedTip: 'Disponible después de completar un viaje',
    reviewBtn: 'Enviar opinión',
    reviewLoading: 'Enviando...',
    reviewSentEyebrow: '¡Gracias!',
    reviewSentHeading: 'Tu opinión ha sido enviada',
    reviewSentP: 'Aparecerá en el sitio una vez que nuestro equipo la revise.',
    reviewSentBtn: 'Dejar otra opinión',
    reservationLabel: 'Reserva',
    passenger: 'pasajero',
    passengers: 'pasajeros',
    confirmedBadge: 'Confirmada',
    cancelBtn: 'Cancelar reserva',
    cancelling: 'Cancelando...',
    cancelledBadge: 'Cancelada',
    cancelSuccess: 'Tu reserva ha sido cancelada.',
    cancelModalTitle: 'Cancelar reserva',
    cancelModalLoading: 'Consultando política de cancelación...',
    cancelModalFeeMsg: 'Se aplicará un cargo de cancelación de ${fee} ({pct}% del total).',
    cancelModalTooLate: 'No es posible cancelar con menos de {hours} horas de anticipación.',
    cancelModalClose: 'Mantener reserva',
    cancelModalConfirm: 'Confirmar cancelación',
  },
};

export type Translations = typeof EN;

@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly lang = signal<Lang>((localStorage.getItem('lang') as Lang) || 'en');
  readonly tx = computed<Translations>(() => (this.lang() === 'es' ? ES : EN));

  toggle(): void {
    const next: Lang = this.lang() === 'en' ? 'es' : 'en';
    this.lang.set(next);
    localStorage.setItem('lang', next);
  }
}
