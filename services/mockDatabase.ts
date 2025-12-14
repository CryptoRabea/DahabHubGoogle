import { Event, ServiceProvider, Booking, User, UserRole, BookingStatus, Review, Post, Comment, AppSettings } from '../types';

const INITIAL_SETTINGS: AppSettings = {
  appName: 'Dahab Echo',
  logoUrl: '', // Empty defaults to text, Admin can upload the logo
  heroImages: [
    "https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?q=80&w=1920&auto=format&fit=crop", // Red Sea Reef
    "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=1920&auto=format&fit=crop", // Clear Beach/Sea
    "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?q=80&w=1920&auto=format&fit=crop", // Desert Mountains
    "https://images.unsplash.com/photo-1539768942893-daf53e448371?q=80&w=1920&auto=format&fit=crop", // Palms & Beach
  ],
  backgroundStyle: `radial-gradient(at 0% 0%, hsla(172, 85%, 93%, 1) 0px, transparent 50%),
    radial-gradient(at 100% 0%, hsla(45, 90%, 96%, 1) 0px, transparent 50%),
    radial-gradient(at 100% 100%, hsla(200, 85%, 95%, 1) 0px, transparent 50%),
    radial-gradient(at 0% 100%, hsla(180, 80%, 94%, 1) 0px, transparent 50%)`
};

// Initial Seed Data
const INITIAL_EVENTS: Event[] = [
  {
    id: 'e1',
    title: 'Blue Hole Deep Dive',
    description: 'Join us for a guided deep dive at the famous Blue Hole. Advanced divers only.',
    date: '2024-06-15',
    time: '08:00 AM',
    location: 'Blue Hole, Dahab',
    coordinates: { lat: 28.5724, lng: 34.5372 },
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
    coordinates: { lat: 28.4836, lng: 34.5097 },
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
    coordinates: { lat: 28.5020, lng: 34.5195 },
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

const INITIAL_REVIEWS: Review[] = [
  {
    id: 'r1',
    itemId: 'p1',
    userId: 'u99',
    userName: 'Jessica M.',
    rating: 5,
    comment: 'Ahmed is always on time and plays great music!',
    timestamp: '2024-05-10T10:00:00Z'
  },
  {
    id: 'r2',
    itemId: 'e1',
    userId: 'u98',
    userName: 'Tom H.',
    rating: 5,
    comment: 'Incredible experience. The guide was very professional.',
    timestamp: '2024-06-01T14:30:00Z'
  }
];

const INITIAL_POSTS: Post[] = [
  {
    id: 'post1',
    authorId: 'admin1',
    authorName: 'Rahma Organizer',
    authorRole: UserRole.ADMIN,
    content: 'Welcome to the AmakenDahab community hub! Share your photos, ask questions, or just say hi. 🌊☀️',
    imageUrl: 'https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?q=80&w=800&auto=format&fit=crop',
    likes: ['u99', 'u98'],
    comments: [
      { id: 'c1', authorId: 'u99', authorName: 'Jessica M.', content: 'Love this app! Dahab needed this.', timestamp: '2024-06-01T10:00:00Z' }
    ],
    timestamp: '2024-06-01T09:00:00Z'
  },
  {
    id: 'post2',
    authorId: 'p1',
    authorName: 'Ahmed Taxi',
    authorRole: UserRole.PROVIDER,
    content: 'Available for pickups from Sharm airport all day tomorrow. DM me or book through the services tab! 🚕',
    likes: [],
    comments: [],
    timestamp: '2024-06-10T15:30:00Z'
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

  // --- SETTINGS ---
  async getSettings(): Promise<AppSettings> {
    await delay(200);
    return this.getStorage<AppSettings>('dahab_settings', INITIAL_SETTINGS);
  }

  async updateSettings(settings: AppSettings): Promise<void> {
    await delay(300);
    this.setStorage('dahab_settings', settings);
  }

  // --- EVENTS ---
  async getEvents(): Promise<Event[]> {
    await delay(300);
    return this.getStorage<Event[]>('dahab_events', INITIAL_EVENTS);
  }

  async addEvent(event: Event): Promise<void> {
    await delay(500);
    const events = await this.getEvents();
    this.setStorage('dahab_events', [event, ...events]);
  }

  // --- PROVIDERS ---
  async getProviders(): Promise<ServiceProvider[]> {
    await delay(300);
    return this.getStorage<ServiceProvider[]>('dahab_providers', INITIAL_PROVIDERS);
  }

  async addProvider(provider: ServiceProvider): Promise<void> {
    await delay(500);
    const providers = await this.getProviders();
    this.setStorage('dahab_providers', [...providers, provider]);
  }

  // --- REVIEWS ---
  async getReviews(itemId: string): Promise<Review[]> {
    await delay(300);
    const reviews = this.getStorage<Review[]>('dahab_reviews', INITIAL_REVIEWS);
    return reviews
      .filter(r => r.itemId === itemId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async addReview(review: Review): Promise<void> {
    await delay(500);
    const reviews = await this.getStorage<Review[]>('dahab_reviews', INITIAL_REVIEWS);
    this.setStorage('dahab_reviews', [review, ...reviews]);

    if (review.itemId.startsWith('p')) {
      const providers = await this.getProviders();
      const itemReviews = [review, ...reviews.filter(r => r.itemId === review.itemId)];
      const avg = itemReviews.reduce((acc, curr) => acc + curr.rating, 0) / itemReviews.length;
      
      const updatedProviders = providers.map(p => 
        p.id === review.itemId ? { ...p, rating: Number(avg.toFixed(1)) } : p
      );
      this.setStorage('dahab_providers', updatedProviders);
    }
  }

  // --- SOCIAL HUB (POSTS) ---
  async getPosts(): Promise<Post[]> {
    await delay(400);
    const posts = this.getStorage<Post[]>('dahab_posts', INITIAL_POSTS);
    return posts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async createPost(post: Post): Promise<void> {
    await delay(600);
    const posts = await this.getPosts();
    this.setStorage('dahab_posts', [post, ...posts]);
  }

  async toggleLikePost(postId: string, userId: string): Promise<void> {
    await delay(200);
    const posts = await this.getPosts();
    const updatedPosts = posts.map(p => {
      if (p.id === postId) {
        const hasLiked = p.likes.includes(userId);
        return {
          ...p,
          likes: hasLiked ? p.likes.filter(id => id !== userId) : [...p.likes, userId]
        };
      }
      return p;
    });
    this.setStorage('dahab_posts', updatedPosts);
  }

  async addComment(postId: string, comment: Comment): Promise<void> {
    await delay(400);
    const posts = await this.getPosts();
    const updatedPosts = posts.map(p => {
      if (p.id === postId) {
        return { ...p, comments: [...p.comments, comment] };
      }
      return p;
    });
    this.setStorage('dahab_posts', updatedPosts);
  }

  // --- BOOKINGS ---
  async getBookings(): Promise<Booking[]> {
    await delay(300);
    return this.getStorage<Booking[]>('dahab_bookings', []);
  }
  
  async getUserBookings(userId: string): Promise<Booking[]> {
    const bookings = await this.getBookings();
    return bookings.filter(b => b.userId === userId);
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

  async toggleSavedEvent(userId: string, eventId: string): Promise<void> {
    await delay(200);
  }

  // --- USER MANAGEMENT ---
  async getUsers(): Promise<User[]> {
    return this.getStorage<User[]>('dahab_users', []);
  }

  async getUser(userId: string): Promise<User | undefined> {
    const users = await this.getUsers();
    return users.find(u => u.id === userId);
  }

  async getPendingProviders(): Promise<User[]> {
    await delay(300);
    const users = await this.getUsers();
    return users.filter(u => u.role === UserRole.PROVIDER && u.providerStatus === 'pending');
  }

  async approveProvider(userId: string): Promise<User | null> {
    await delay(500);
    const users = await this.getUsers();
    let approvedUser: User | null = null;
    
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        approvedUser = { ...u, providerStatus: 'approved' };
        return approvedUser;
      }
      return u;
    });
    this.setStorage('dahab_users', updatedUsers);
    
    // Create public ServiceProvider profile
    if (approvedUser) {
      const providers = await this.getProviders();
      // Avoid duplicate entries
      if (!providers.find(p => p.id === userId)) {
        const newProvider: ServiceProvider = {
          id: userId,
          name: (approvedUser as User).name,
          serviceType: 'Driver', // Default, editable later
          description: 'Verified service provider',
          phone: '',
          rating: 5.0,
          imageUrl: 'https://picsum.photos/200/200?random=' + userId,
          isVerified: true
        };
        this.setStorage('dahab_providers', [...providers, newProvider]);
      }
    }
    
    return approvedUser;
  }
  
  async rejectProvider(userId: string): Promise<void> {
    await delay(300);
    const users = await this.getUsers();
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        return { ...u, role: UserRole.USER, providerStatus: 'rejected' as const };
      }
      return u;
    });
    this.setStorage('dahab_users', updatedUsers);
  }

  // --- AUTH ---
  async sendVerificationCode(email: string): Promise<boolean> {
    await delay(1000);
    return true;
  }

  async verifyAndCreateUser(name: string, email: string, code: string, isProviderSignup: boolean = false): Promise<User | null> {
    await delay(1000);
    if (code === '1234') {
      const isAdmin = name.trim() === 'RahmaOrganizer' || name.trim() === 'Rahma Organizer';
      
      const role = isAdmin ? UserRole.ADMIN : isProviderSignup ? UserRole.PROVIDER : UserRole.USER;
      const providerStatus = isProviderSignup ? 'pending' : undefined;

      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        email,
        role: role,
        providerStatus: providerStatus,
        isEmailVerified: true,
        provider: 'email',
        savedEventIds: []
      };

      // Persist user for admin to see
      const users = await this.getUsers();
      this.setStorage('dahab_users', [...users, newUser]);

      return newUser;
    }
    return null;
  }

  async socialLogin(provider: 'google' | 'facebook'): Promise<User> {
    await delay(1500); 
    const user = {
      id: Math.random().toString(36).substr(2, 9),
      name: provider === 'google' ? 'Google User' : 'Facebook User',
      email: provider === 'google' ? 'user@gmail.com' : 'user@facebook.com',
      role: UserRole.USER,
      isEmailVerified: true,
      provider: provider,
      savedEventIds: []
    };
    // Persist
    const users = await this.getUsers();
    this.setStorage('dahab_users', [...users, user]);
    return user;
  }

  async login(role: UserRole): Promise<User> {
    await delay(500);
    // Return approved demo users
    return {
      id: role === UserRole.ADMIN ? 'admin1' : role === UserRole.PROVIDER ? 'p1' : 'user1',
      name: role === UserRole.ADMIN ? 'Rahma Organizer' : role === UserRole.PROVIDER ? 'Ahmed Taxi' : 'Dahab Explorer',
      role: role,
      providerStatus: role === UserRole.PROVIDER ? 'approved' : undefined,
      email: role === UserRole.ADMIN ? 'admin@dahabhub.com' : 'user@gmail.com',
      isEmailVerified: true,
      provider: 'email',
      savedEventIds: []
    };
  }
}

export const db = new MockDatabase();