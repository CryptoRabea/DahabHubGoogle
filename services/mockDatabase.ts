
import { Event, ServiceProvider, Booking, User, UserRole, BookingStatus, Review, Post, Comment, AppSettings, NavItem, HomeSection } from '../types';

// Increment this version to force a data reset on client browsers
const DB_VERSION = '2.4'; 

// Default Navigation
const DEFAULT_NAV: NavItem[] = [
  { id: 'nav-1', label: 'Home', path: '/', icon: 'Home', order: 1, isVisible: true },
  { id: 'nav-2', label: 'Events', path: '/events', icon: 'Calendar', order: 2, isVisible: true },
  { id: 'nav-3', label: 'Services', path: '/services', icon: 'Car', order: 3, isVisible: true },
  { id: 'nav-4', label: 'Community', path: '/community', icon: 'Users', order: 4, isVisible: true },
  { id: 'nav-5', label: 'More', path: '/more', icon: 'Menu', order: 5, isVisible: true },
];

// Default Home Page Layout
const DEFAULT_HOME_LAYOUT: HomeSection[] = [
  { id: 'sec-1', type: 'hero', order: 1, isVisible: true },
  { id: 'sec-2', type: 'categories', order: 2, isVisible: true },
  { id: 'sec-3', type: 'featured', order: 3, isVisible: true },
  { id: 'sec-4', type: 'banner', order: 4, isVisible: true },
];

// Default settings if none exist in DB
const INITIAL_SETTINGS: AppSettings = {
  appName: 'AmakenDahab',
  logoUrl: 'https://cdn-icons-png.flaticon.com/512/1042/1042390.png', 
  heroImages: [
    "https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?q=80&w=1920&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=1920&auto=format&fit=crop"
  ],
  backgroundStyle: 'linear-gradient(to bottom, #0f172a, #1e293b)',
  contentOverrides: {},
  navigation: DEFAULT_NAV,
  homeLayout: DEFAULT_HOME_LAYOUT
};

// Seed Data
const SEED_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Blue Hole Diving',
    description: 'Experience the legendary Blue Hole with certified guides.',
    date: '2024-12-01',
    time: '09:00 AM',
    location: 'Blue Hole',
    price: 450,
    imageUrl: 'https://images.unsplash.com/photo-1582967788606-a171f1080ca8?auto=format&fit=crop&q=80&w=1000',
    category: 'Diving',
    organizerId: 'admin1',
    status: 'approved',
    isFeatured: true
  }
];

const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

const getItem = <T>(key: string, defaultVal: T): T => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
};

const setItem = (key: string, val: any) => {
  localStorage.setItem(key, JSON.stringify(val));
};

class MockDatabaseService {
  constructor() {
    this._initSeeds();
  }

  private _initSeeds() {
    const currentVersion = localStorage.getItem('db_version');
    if (currentVersion !== DB_VERSION) {
      localStorage.removeItem('events');
      localStorage.removeItem('providers');
      localStorage.removeItem('settings');
      localStorage.removeItem('users'); // Reset users to ensure clean state
      localStorage.setItem('db_version', DB_VERSION);
    }

    if (!localStorage.getItem('events')) setItem('events', SEED_EVENTS);
    if (!localStorage.getItem('settings')) setItem('settings', INITIAL_SETTINGS);
    
    const users = getItem<User[]>('users', []);
    
    // Seed Admin
    if (!users.find(u => u.email === 'admin@dahab.com')) {
        users.push({
            id: 'admin1',
            name: 'Admin User',
            email: 'admin@dahab.com',
            role: UserRole.ADMIN,
            savedEventIds: []
        });
    }

    // Seed Provider
    if (!users.find(u => u.email === 'provider@dahab.com')) {
        users.push({
            id: 'provider1',
            name: 'Dahab Divers',
            email: 'provider@dahab.com',
            role: UserRole.PROVIDER,
            providerStatus: 'approved',
            savedEventIds: []
        });
    }

    // Seed Regular User
    if (!users.find(u => u.email === 'user@dahab.com')) {
        users.push({
            id: 'user1',
            name: 'John Doe',
            email: 'user@dahab.com',
            role: UserRole.USER,
            savedEventIds: []
        });
    }

    setItem('users', users);
  }

  async login(email: string, password: string): Promise<User> {
    await delay();
    const users = getItem<User[]>('users', []);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (user) {
      return user;
    } else {
      const error: any = new Error("User not found");
      error.code = "auth/user-not-found";
      throw error;
    }
  }

  async register(name: string, email: string, password: string, isProvider: boolean): Promise<User> {
    await delay();
    const users = getItem<User[]>('users', []);
    
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      const error: any = new Error("Email in use");
      error.code = "auth/email-already-in-use";
      throw error;
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      role: isProvider ? UserRole.PROVIDER : UserRole.USER,
      providerStatus: isProvider ? 'pending' : undefined,
      isEmailVerified: false,
      provider: 'email',
      savedEventIds: []
    };

    users.push(newUser);
    setItem('users', users);
    return newUser;
  }

  async socialLogin(providerType: 'google' | 'facebook'): Promise<User> {
    await delay();
    const users = getItem<User[]>('users', []);
    const email = `testuser@${providerType}.com`;
    let user = users.find(u => u.email === email);
    if (!user) {
      user = {
        id: Math.random().toString(36).substr(2, 9),
        name: `${providerType.charAt(0).toUpperCase() + providerType.slice(1)} User`,
        email,
        role: UserRole.USER,
        isEmailVerified: true,
        provider: providerType as any,
        savedEventIds: []
      };
      users.push(user);
      setItem('users', users);
    }
    return user;
  }

  async logout(): Promise<void> { await delay(100); }
  async getSettings(): Promise<AppSettings> {
    const settings = getItem<AppSettings>('settings', INITIAL_SETTINGS);
    return settings;
  }
  async updateSettings(settings: AppSettings): Promise<void> { setItem('settings', settings); }
  async updateContentOverride(key: string, value: string): Promise<void> {
      const settings = getItem<AppSettings>('settings', INITIAL_SETTINGS);
      settings.contentOverrides[key] = value;
      setItem('settings', settings);
  }
  async getEvents(): Promise<Event[]> { return getItem<Event[]>('events', []); }
  async getPublicEvents(): Promise<Event[]> {
    const events = getItem<Event[]>('events', []);
    return events.filter(e => e.status === 'approved');
  }
  async addEvent(event: Event): Promise<void> {
    const events = getItem<Event[]>('events', []);
    events.push(event);
    setItem('events', events);
  }
  async updateEvent(updatedEvent: Event): Promise<void> {
    const events = getItem<Event[]>('events', []);
    const index = events.findIndex(e => e.id === updatedEvent.id);
    if (index !== -1) { events[index] = updatedEvent; setItem('events', events); }
  }
  async deleteEvent(eventId: string): Promise<void> {
    const events = getItem<Event[]>('events', []);
    setItem('events', events.filter(e => e.id !== eventId));
  }
  async toggleFeaturedEvent(eventId: string, featured: boolean): Promise<void> {
     const events = getItem<Event[]>('events', []);
     const event = events.find(e => e.id === eventId);
     if(event) { event.isFeatured = featured; setItem('events', events); }
  }
  async getProviders(): Promise<ServiceProvider[]> { return getItem<ServiceProvider[]>('providers', []); }
  async getReviews(itemId: string): Promise<Review[]> {
    const reviews = getItem<Review[]>('reviews', []);
    return reviews.filter(r => r.itemId === itemId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  async addReview(review: Review): Promise<void> {
    const reviews = getItem<Review[]>('reviews', []);
    reviews.push(review);
    setItem('reviews', reviews);
  }
  async getPosts(): Promise<Post[]> { return getItem<Post[]>('posts', []).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); }
  async createPost(post: Post): Promise<void> {
    const posts = getItem<Post[]>('posts', []);
    posts.unshift(post);
    setItem('posts', posts);
  }
  async toggleLikePost(postId: string, userId: string): Promise<void> {
    const posts = getItem<Post[]>('posts', []);
    const post = posts.find(p => p.id === postId);
    if (post) {
      const hasLiked = post.likes.includes(userId);
      post.likes = hasLiked ? post.likes.filter(id => id !== userId) : [...post.likes, userId];
      setItem('posts', posts);
    }
  }
  async addComment(postId: string, comment: Comment): Promise<void> {
    const posts = getItem<Post[]>('posts', []);
    const post = posts.find(p => p.id === postId);
    if (post) { post.comments = [...(post.comments || []), comment]; setItem('posts', posts); }
  }
  async getBookings(): Promise<Booking[]> { return getItem<Booking[]>('bookings', []).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); }
  async getUserBookings(userId: string): Promise<Booking[]> { return getItem<Booking[]>('bookings', []).filter(b => b.userId === userId); }
  async createBooking(booking: Booking): Promise<void> {
    const bookings = getItem<Booking[]>('bookings', []);
    bookings.push(booking);
    setItem('bookings', bookings);
  }
  async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<void> {
    const bookings = getItem<Booking[]>('bookings', []);
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) { booking.status = status; setItem('bookings', bookings); }
  }
  async toggleSavedEvent(userId: string, eventId: string): Promise<void> {
    const users = getItem<User[]>('users', []);
    const user = users.find(u => u.id === userId);
    if (user) {
      const saved = user.savedEventIds || [];
      const isSaved = saved.includes(eventId);
      user.savedEventIds = isSaved ? saved.filter(id => id !== eventId) : [...saved, eventId];
      setItem('users', users);
    }
  }
  async getUser(userId: string): Promise<User | undefined> {
    const users = getItem<User[]>('users', []);
    return users.find(u => u.id === userId);
  }
  async getPendingProviders(): Promise<User[]> {
    const users = getItem<User[]>('users', []);
    return users.filter(u => u.providerStatus === 'pending' || u.providerStatus === 'payment_review');
  }
  async requestProviderPayment(userId: string): Promise<void> {
    const users = getItem<User[]>('users', []);
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) { users[userIndex].providerStatus = 'pending_payment'; setItem('users', users); }
  }
  async submitProviderPayment(userId: string, receiptUrl: string): Promise<void> {
      const users = getItem<User[]>('users', []);
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        users[userIndex].providerStatus = 'payment_review';
        users[userIndex].subscriptionReceipt = receiptUrl;
        setItem('users', users);
      }
  }
  async approveProvider(userId: string): Promise<User | null> {
    const users = getItem<User[]>('users', []);
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex].providerStatus = 'approved';
      setItem('users', users);
      return users[userIndex];
    }
    return null;
  }
  async rejectProvider(userId: string): Promise<void> {
    const users = getItem<User[]>('users', []);
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex].role = UserRole.USER;
      users[userIndex].providerStatus = 'rejected';
      setItem('users', users);
    }
  }
}

export const db = new MockDatabaseService();
