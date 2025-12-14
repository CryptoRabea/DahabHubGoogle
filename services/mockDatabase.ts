import { Event, ServiceProvider, Booking, User, UserRole, BookingStatus } from '../types';

// Initial Seed Data
const INITIAL_EVENTS: Event[] = [
  {
    id: 'e1',
    title: 'Blue Hole Deep Dive',
    description: 'Join us for a guided deep dive at the famous Blue Hole. Advanced divers only.',
    date: '2024-06-15',
    time: '08:00 AM',
    location: 'Blue Hole, Dahab',
    price: 1500,
    imageUrl: 'https://picsum.photos/800/600?random=1',
    organizerId: 'admin1',
    category: 'Diving'
  },
  {
    id: 'e2',
    title: 'Laguna Sunset Yoga',
    description: 'Relax and unwind with a sunset yoga session at the Laguna sandbar.',
    date: '2024-06-16',
    time: '05:30 PM',
    location: 'The Laguna',
    price: 300,
    imageUrl: 'https://picsum.photos/800/600?random=2',
    organizerId: 'admin1',
    category: 'Wellness'
  },
  {
    id: 'e3',
    title: 'Friday Night Social',
    description: 'Community gathering with live music and local food.',
    date: '2024-06-18',
    time: '09:00 PM',
    location: 'Lighthouse Area',
    price: 200,
    imageUrl: 'https://picsum.photos/800/600?random=3',
    organizerId: 'admin1',
    category: 'Party'
  }
];

const INITIAL_PROVIDERS: ServiceProvider[] = [
  {
    id: 'p1',
    name: 'Ahmed Taxi',
    serviceType: 'Driver',
    description: 'Reliable airport transfers and trips to Blue Hole/Three Pools.',
    phone: '0100000001',
    rating: 4.8,
    imageUrl: 'https://picsum.photos/200/200?random=4',
    isVerified: true
  },
  {
    id: 'p2',
    name: 'Sara Home Care',
    serviceType: 'Cleaner',
    description: 'Professional housekeeping and laundry services.',
    phone: '0100000002',
    rating: 4.9,
    imageUrl: 'https://picsum.photos/200/200?random=5',
    isVerified: true
  }
];

// Helper to simulate DB delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class MockDatabase {
  private getStorage<T>(key: string, initial: T): T {
    const stored = localStorage.getItem(key);
    if (!stored) {
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(stored);
  }

  private setStorage(key: string, data: any) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  async getEvents(): Promise<Event[]> {
    await delay(300);
    return this.getStorage<Event[]>('dahab_events', INITIAL_EVENTS);
  }

  async addEvent(event: Event): Promise<void> {
    await delay(500);
    const events = await this.getEvents();
    this.setStorage('dahab_events', [event, ...events]);
  }

  async getProviders(): Promise<ServiceProvider[]> {
    await delay(300);
    return this.getStorage<ServiceProvider[]>('dahab_providers', INITIAL_PROVIDERS);
  }

  async addProvider(provider: ServiceProvider): Promise<void> {
    await delay(500);
    const providers = await this.getProviders();
    this.setStorage('dahab_providers', [...providers, provider]);
  }

  async getBookings(): Promise<Booking[]> {
    await delay(300);
    return this.getStorage<Booking[]>('dahab_bookings', []);
  }

  async createBooking(booking: Booking): Promise<void> {
    await delay(800);
    const bookings = await this.getBookings();
    this.setStorage('dahab_bookings', [booking, ...bookings]);
  }

  async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<void> {
    await delay(400);
    const bookings = await this.getBookings();
    const updated = bookings.map(b => b.id === bookingId ? { ...b, status } : b);
    this.setStorage('dahab_bookings', updated);
  }

  // Auth Simulation
  
  // 1. Simulate sending verification code
  async sendVerificationCode(email: string): Promise<boolean> {
    await delay(1000);
    // In a real app, this would send an email. 
    // Here we just return true to indicate "sent".
    // The fixed code for demo is '1234'.
    return true;
  }

  // 2. Verify code and create user
  async verifyAndCreateUser(name: string, email: string, code: string): Promise<User | null> {
    await delay(1000);
    if (code === '1234') {
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        email,
        role: UserRole.USER,
        isEmailVerified: true,
        provider: 'email'
      };
      return newUser;
    }
    return null;
  }

  // 3. Social Login
  async socialLogin(provider: 'google' | 'facebook'): Promise<User> {
    await delay(1500); // Network delay
    return {
      id: Math.random().toString(36).substr(2, 9),
      name: provider === 'google' ? 'Google User' : 'Facebook User',
      email: provider === 'google' ? 'user@gmail.com' : 'user@facebook.com',
      role: UserRole.USER,
      isEmailVerified: true,
      provider: provider
    };
  }

  // 4. Legacy/Demo Login
  async login(role: UserRole): Promise<User> {
    await delay(500);
    return {
      id: role === UserRole.ADMIN ? 'admin1' : 'user1',
      name: role === UserRole.ADMIN ? 'Sarah Organizer' : 'Dahab Explorer',
      role: role,
      email: role === UserRole.ADMIN ? 'admin@dahabhub.com' : 'user@gmail.com',
      isEmailVerified: true,
      provider: 'email'
    };
  }
}

export const db = new MockDatabase();