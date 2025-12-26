
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  PROVIDER = 'provider'
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected'
}

export enum PaymentMethod {
  VODAFONE_CASH = 'Vodafone Cash',
  INSTAPAY = 'Instapay'
}

// --- Dynamic UI Types ---
export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: string; 
  order: number;
  isVisible: boolean;
}

export interface CardItem {
  id: string;
  title: string;
  imageUrl: string;
  link: string;
}

export interface HomeSection {
  id: string;
  type: 'hero' | 'categories' | 'featured' | 'banner' | 'text' | 'image-box' | 'card-grid';
  order: number;
  isVisible: boolean;
  data?: any; 
}

export interface HeroConfig {
  height: string; 
  displayLimit: number;
  autoPlaySpeed: number;
}
// ------------------------

export interface AppSettings {
  appName: string;
  logoUrl: string; 
  heroImages: string[];
  heroConfig?: HeroConfig;
  backgroundStyle: string; 
  contentOverrides: { [key: string]: string };
  navigation: NavItem[];
  homeLayout: HomeSection[];
  // Mapping of route path to array of custom sections
  pageLayouts?: Record<string, HomeSection[]>;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  bio?: string;
  providerStatus?: 'pending' | 'pending_payment' | 'payment_review' | 'approved' | 'rejected';
  email: string;
  isEmailVerified?: boolean;
  provider?: 'email' | 'google' | 'facebook';
  savedEventIds: string[];
  subscriptionReceipt?: string;
}

export interface Review {
  id: string;
  itemId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  timestamp: string;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  timestamp: string;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  content: string;
  imageUrl?: string;
  likes: string[];
  comments: Comment[];
  timestamp: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  price: number;
  imageUrl: string;
  organizerId: string;
  category: 'Party' | 'Hike' | 'Diving' | 'Wellness' | 'Workshop';
  status: 'pending' | 'approved' | 'rejected';
  isFeatured?: boolean;
}

export interface ServiceProvider {
  id: string;
  name: string;
  serviceType: 'Driver' | 'Cleaner' | 'Guide' | 'Maintenance';
  description: string;
  phone: string;
  rating: number;
  imageUrl: string;
  isVerified: boolean;
}

export interface Booking {
  id: string;
  itemId: string;
  itemType: 'event' | 'service';
  userId: string;
  userName: string;
  amount: number;
  method: PaymentMethod;
  status: BookingStatus;
  timestamp: string;
  receiptImage?: string;
}
