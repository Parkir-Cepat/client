// Forms and Input Types
export interface ParkingSearchForm {
  location: string;
  vehicleType: string;
  duration: number;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: 'user' | 'landowner';
}

export interface UpdateProfileInput {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

// User Types
export interface User {
  _id: string;
  id: string;
  email: string;
  name: string;
  role: 'user' | 'landowner' | 'admin';
  saldo: number;
  avatar?: string;
  profilePicture?: string;
  phone?: string;
  address?: string;
  isEmailVerified: boolean;
  isOnline?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Location Types
export interface Location {
  type: 'Point';
  coordinates: [number, number]; // [lng, lat]
}

export interface Coordinates {
  lat: number;
  lng: number;
}

// Parking Lot Types
export interface ParkingLot {
  _id: string;
  name: string;
  address: string;
  description?: string;
  photos: string[];
  images?: string[]; // Additional alias for photos
  location: Location;
  owner: User;
  capacity: {
    car: number;
    motorcycle: number;
  };
  available: {
    car: number;
    motorcycle: number;
  };
  rates: {
    car: number;
    motorcycle: number;
  };
  availableSlots: number;
  totalSlots: number;
  vehicleTypes: string[];
  tariff: number;
  operationalHours: {
    open: string;
    close: string;
  };
  facilities: string[];
  rating: number;
  reviews: Review[];
  isActive: boolean;
  distance?: number;
  status: string;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateParkingLotInput {
  name: string;
  address: string;
  description?: string;
  photos: string[];
  location: Coordinates;
  totalSlots: number;
  vehicleTypes: string[];
  tariff: number;
  operationalHours: {
    open: string;
    close: string;
  };
  facilities: string[];
}

export interface UpdateParkingLotInput extends Partial<CreateParkingLotInput> {
  _id: string;
}

// Review Types
export interface Review {
  _id: string;
  user: User;
  parkingLot: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface CreateReviewInput {
  parkingLotId: string;
  rating: number;
  comment?: string;
}

// Booking Types
export interface Booking {
  _id: string;
  id: string;
  user: User;
  parkingLot: ParkingLot;
  vehicleType: string;
  startTime: string;
  endTime: string;
  duration: number;
  cost: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  qrCode?: string;
  entryQR?: string;
  exitQR?: string;
  payment?: Payment;
  extendedDuration?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingInput {
  parkingLotId: string;
  vehicleType: string;
  startTime: string;
  duration: number;
}

export interface ExtendBookingInput {
  bookingId: string;
  additionalDuration: number;
}

// Payment Types
export interface Payment {
  _id: string;
  user: string;
  booking?: string;
  amount: number;
  paymentMethod: 'qris' | 'virtual_account' | 'ewallet' | 'credit_card' | 'saldo';
  status: 'pending' | 'success' | 'failed' | 'cancelled';
  paymentUrl?: string;
  paymentToken?: string;
  transactionId?: string;
  midtransTransactionId?: string;
  type: 'booking' | 'topup';
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentInput {
  bookingId?: string;
  amount: number;
  paymentMethod: string;
  type: 'booking' | 'topup';
}

export interface TopUpInput {
  amount: number;
  paymentMethod: string;
}

// Saldo Transaction Types
export interface SaldoTransaction {
  _id: string;
  user: string;
  amount: number;
  type: 'topup' | 'payment' | 'refund';
  description: string;
  balanceBefore: number;
  balanceAfter: number;
  payment?: string;
  createdAt: string;
}

// Chat Types
export interface Chat {
  _id: string;
  booking: string;
  sender: User;
  receiver: User;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface SendChatInput {
  bookingId: string;
  receiverId: string;
  message: string;
}

// Notification Types
export interface Notification {
  _id: string;
  user: string;
  type: 'booking' | 'payment' | 'chat' | 'system';
  title: string;
  message: string;
  data?: unknown;
  isRead: boolean;
  createdAt: string;
}

// Search Types
export interface SearchParkingLotsInput {
  lat: number;
  lng: number;
  radius?: number;
  vehicleType?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'distance' | 'price' | 'rating';
  limit?: number;
  offset?: number;
}

// Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

// Error Types
export interface ApiError {
  message: string;
  code?: string;
  data?: unknown;
}

// Midtrans Types
export interface MidtransSnapToken {
  token: string;
  redirect_url: string;
}

export interface MidtransTransaction {
  order_id: string;
  gross_amount: number;
  payment_type: string;
  transaction_status: string;
  fraud_status?: string;
  settlement_time?: string;
}

// Socket Event Types
export interface SocketEvents {
  BOOKING_CREATED: Booking;
  BOOKING_UPDATED: Booking;
  PAYMENT_UPDATED: Payment;
  CHAT_SENT: Chat;
  NOTIFICATION_NEW: Notification;
}

// Component Props Types
export interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

export interface ErrorProps {
  message: string;
  onRetry?: () => void;
}

// Hook Return Types
export interface UseAuthReturn {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
  googleAuth: (token: string) => Promise<void>;
}

export interface UseLocationReturn {
  currentLocation: Coordinates | null;
  isLoading: boolean;
  error: string | null;
  getCurrentLocation: () => Promise<void>;
  geocodeAddress: (address: string) => Promise<Coordinates | null>;
}

export interface UseParkingSearchReturn {
  searchResults: ParkingLot[];
  isLoading: boolean;
  error: string | null;
  searchParkingLots: (input: SearchParkingLotsInput) => Promise<void>;
  clearResults: () => void;
}
