
import { 
    signInWithEmailAndPassword, createUserWithEmailAndPassword, 
    signOut, signInWithPopup, updateProfile, UserCredential 
} from 'firebase/auth';
import { 
    collection, doc, getDoc, setDoc, getDocs, updateDoc, 
    deleteDoc, query, where, orderBy, addDoc, arrayUnion, arrayRemove,
    Timestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, dbFirestore, storage, googleProvider, facebookProvider } from './firebase';
import { Event, ServiceProvider, Booking, User, UserRole, BookingStatus, Review, Post, Comment, AppSettings, NavItem, HomeSection } from '../types';

// Default Data for Initialization
const DEFAULT_NAV: NavItem[] = [
  { id: 'nav-1', label: 'Home', path: '/', icon: 'Home', order: 1, isVisible: true },
  { id: 'nav-2', label: 'Events', path: '/events', icon: 'Calendar', order: 2, isVisible: true },
  { id: 'nav-3', label: 'Services', path: '/services', icon: 'Car', order: 3, isVisible: true },
  { id: 'nav-4', label: 'Community', path: '/community', icon: 'Users', order: 4, isVisible: true },
  { id: 'nav-5', label: 'More', path: '/more', icon: 'Menu', order: 5, isVisible: true },
];

const DEFAULT_HOME_LAYOUT: HomeSection[] = [
  { id: 'sec-1', type: 'hero', order: 1, isVisible: true },
  { id: 'sec-2', type: 'categories', order: 2, isVisible: true },
  { id: 'sec-3', type: 'featured', order: 3, isVisible: true },
  { id: 'sec-4', type: 'banner', order: 4, isVisible: true },
];

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

// --- Helper Functions ---

const uploadImageIfBase64 = async (path: string, urlOrBase64: string | undefined): Promise<string | undefined> => {
    if (!urlOrBase64) return undefined;
    if (urlOrBase64.startsWith('http')) return urlOrBase64;
    
    try {
        const storageRef = ref(storage, `${path}/${Date.now()}_${Math.random().toString(36).substr(2,9)}`);
        const response = await fetch(urlOrBase64);
        const blob = await response.blob();
        await uploadBytes(storageRef, blob);
        return await getDownloadURL(storageRef);
    } catch (e) {
        console.error("Image upload failed", e);
        return urlOrBase64; // Fallback
    }
};

const mapDoc = <T>(doc: any): T => ({ id: doc.id, ...doc.data() });

class DatabaseService {
  
  // --- AUTHENTICATION ---

  async login(email: string, password: string): Promise<User> {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return await this._getUserProfile(cred.user.uid);
  }

  async register(name: string, email: string, password: string, isProvider: boolean): Promise<User> {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    
    const newUser: User = {
      id: cred.user.uid,
      name,
      email,
      role: isProvider ? UserRole.PROVIDER : UserRole.USER,
      providerStatus: isProvider ? 'pending' : undefined,
      isEmailVerified: false,
      provider: 'email',
      savedEventIds: []
    };

    await setDoc(doc(dbFirestore, 'users', cred.user.uid), newUser);
    return newUser;
  }

  async socialLogin(providerType: 'google' | 'facebook'): Promise<User> {
    const provider = providerType === 'google' ? googleProvider : facebookProvider;
    const cred = await signInWithPopup(auth, provider);
    
    const userDoc = await getDoc(doc(dbFirestore, 'users', cred.user.uid));
    
    if (userDoc.exists()) {
      return userDoc.data() as User;
    } else {
      const newUser: User = {
        id: cred.user.uid,
        name: cred.user.displayName || 'User',
        email: cred.user.email || '',
        role: UserRole.USER,
        isEmailVerified: true,
        provider: providerType,
        savedEventIds: []
      };
      await setDoc(doc(dbFirestore, 'users', cred.user.uid), newUser);
      return newUser;
    }
  }

  async logout(): Promise<void> {
    await signOut(auth);
  }

  async getUser(userId: string): Promise<User | undefined> {
      return await this._getUserProfile(userId);
  }

  private async _getUserProfile(uid: string): Promise<User> {
      const d = await getDoc(doc(dbFirestore, 'users', uid));
      if (d.exists()) return d.data() as User;
      throw new Error('User profile not found');
  }

  // --- SETTINGS ---
  
  async getSettings(): Promise<AppSettings> {
    const d = await getDoc(doc(dbFirestore, 'config', 'appSettings'));
    if (d.exists()) {
        const data = d.data() as AppSettings;
        // Migrations / Defaults
        if (!data.navigation) data.navigation = DEFAULT_NAV;
        if (!data.homeLayout) data.homeLayout = DEFAULT_HOME_LAYOUT;
        return data;
    } else {
        await setDoc(doc(dbFirestore, 'config', 'appSettings'), INITIAL_SETTINGS);
        return INITIAL_SETTINGS;
    }
  }

  async updateSettings(settings: AppSettings): Promise<void> {
    // Check if logoUrl is base64 and upload it
    if (settings.logoUrl && !settings.logoUrl.startsWith('http')) {
        settings.logoUrl = await uploadImageIfBase64('settings', settings.logoUrl) || settings.logoUrl;
    }
    await setDoc(doc(dbFirestore, 'config', 'appSettings'), settings);
  }
  
  async updateContentOverride(key: string, value: string): Promise<void> {
      // If value is an image (base64), upload it first
      let finalValue = value;
      if (value.startsWith('data:image')) {
          finalValue = await uploadImageIfBase64('content', value) || value;
      }
      
      const settingsRef = doc(dbFirestore, 'config', 'appSettings');
      await updateDoc(settingsRef, {
          [`contentOverrides.${key}`]: finalValue
      });
  }

  // --- EVENTS ---
  
  async getEvents(): Promise<Event[]> {
    const q = query(collection(dbFirestore, 'events'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Event));
  }

  async getPublicEvents(): Promise<Event[]> {
    const q = query(collection(dbFirestore, 'events'), where('status', '==', 'approved'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Event));
  }

  async addEvent(event: Event): Promise<void> {
    // Upload image
    const imageUrl = await uploadImageIfBase64('events', event.imageUrl);
    const newEvent = { ...event, imageUrl: imageUrl || event.imageUrl };
    
    // We use setDoc with the ID generated or passed, or addDoc if ID not strict
    if (event.id) {
        await setDoc(doc(dbFirestore, 'events', event.id), newEvent);
    } else {
        await addDoc(collection(dbFirestore, 'events'), newEvent);
    }
  }

  async updateEvent(updatedEvent: Event): Promise<void> {
    const imageUrl = await uploadImageIfBase64('events', updatedEvent.imageUrl);
    await updateDoc(doc(dbFirestore, 'events', updatedEvent.id), {
        ...updatedEvent,
        imageUrl: imageUrl || updatedEvent.imageUrl
    });
  }

  async deleteEvent(eventId: string): Promise<void> {
    await deleteDoc(doc(dbFirestore, 'events', eventId));
  }

  async toggleFeaturedEvent(eventId: string, featured: boolean): Promise<void> {
     await updateDoc(doc(dbFirestore, 'events', eventId), { isFeatured: featured });
  }

  // --- PROVIDERS ---
  
  async getProviders(): Promise<ServiceProvider[]> {
    const q = query(collection(dbFirestore, 'providers'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ServiceProvider));
  }

  // --- REVIEWS ---
  
  async getReviews(itemId: string): Promise<Review[]> {
    const q = query(collection(dbFirestore, 'reviews'), where('itemId', '==', itemId)); // orderBy requires index, doing in-memory sort for simplicity
    const snapshot = await getDocs(q);
    const reviews = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Review));
    return reviews.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async addReview(review: Review): Promise<void> {
    await addDoc(collection(dbFirestore, 'reviews'), review);
    
    // Aggregation logic (simplified)
    if (review.itemId) {
        const allReviews = await this.getReviews(review.itemId);
        const avg = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;
        
        // Try updating provider if exists
        const providerRef = doc(dbFirestore, 'providers', review.itemId);
        const providerSnap = await getDoc(providerRef);
        if (providerSnap.exists()) {
            await updateDoc(providerRef, { rating: Number(avg.toFixed(1)) });
        }
    }
  }

  // --- SOCIAL HUB (POSTS) ---
  
  async getPosts(): Promise<Post[]> {
    const q = query(collection(dbFirestore, 'posts'), orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Post));
  }

  async createPost(post: Post): Promise<void> {
    const imageUrl = await uploadImageIfBase64('posts', post.imageUrl);
    await addDoc(collection(dbFirestore, 'posts'), { ...post, imageUrl });
  }

  async toggleLikePost(postId: string, userId: string): Promise<void> {
    const postRef = doc(dbFirestore, 'posts', postId);
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
        const post = postSnap.data() as Post;
        const hasLiked = post.likes.includes(userId);
        if (hasLiked) {
            await updateDoc(postRef, { likes: arrayRemove(userId) });
        } else {
            await updateDoc(postRef, { likes: arrayUnion(userId) });
        }
    }
  }

  async addComment(postId: string, comment: Comment): Promise<void> {
    const postRef = doc(dbFirestore, 'posts', postId);
    await updateDoc(postRef, {
        comments: arrayUnion(comment)
    });
  }

  // --- BOOKINGS ---
  
  async getBookings(): Promise<Booking[]> {
    const q = query(collection(dbFirestore, 'bookings'), orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Booking));
  }
  
  async getUserBookings(userId: string): Promise<Booking[]> {
    const q = query(collection(dbFirestore, 'bookings'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Booking));
  }

  async createBooking(booking: Booking): Promise<void> {
    // If receipt is base64
    const receiptUrl = await uploadImageIfBase64('receipts', booking.receiptImage);
    await addDoc(collection(dbFirestore, 'bookings'), { ...booking, receiptImage: receiptUrl });
  }

  async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<void> {
    await updateDoc(doc(dbFirestore, 'bookings', bookingId), { status });
  }

  // --- USER MANAGEMENT ---
  
  async toggleSavedEvent(userId: string, eventId: string): Promise<void> {
    const userRef = doc(dbFirestore, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        const user = userSnap.data() as User;
        const saved = user.savedEventIds || [];
        if (saved.includes(eventId)) {
            await updateDoc(userRef, { savedEventIds: arrayRemove(eventId) });
        } else {
            await updateDoc(userRef, { savedEventIds: arrayUnion(eventId) });
        }
    }
  }

  async getPendingProviders(): Promise<User[]> {
    const q = query(collection(dbFirestore, 'users'), where('role', '==', 'provider'));
    const snapshot = await getDocs(q);
    return snapshot.docs
        .map(d => ({ id: d.id, ...d.data() } as User))
        .filter(u => u.providerStatus === 'pending' || u.providerStatus === 'payment_review');
  }

  async requestProviderPayment(userId: string): Promise<void> {
    await updateDoc(doc(dbFirestore, 'users', userId), { providerStatus: 'pending_payment' });
  }

  async submitProviderPayment(userId: string, receiptBase64: string): Promise<void> {
      const receiptUrl = await uploadImageIfBase64('subscription_receipts', receiptBase64);
      await updateDoc(doc(dbFirestore, 'users', userId), { 
          providerStatus: 'payment_review',
          subscriptionReceipt: receiptUrl
      });
  }

  async approveProvider(userId: string): Promise<User | null> {
    const userRef = doc(dbFirestore, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
        const user = userSnap.data() as User;
        await updateDoc(userRef, { providerStatus: 'approved' });
        
        // Create public provider profile
        const newProvider: ServiceProvider = {
            id: userId,
            name: user.name,
            serviceType: 'Driver',
            description: 'Verified service provider',
            phone: '',
            rating: 5.0,
            imageUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
            isVerified: true
        };
        await setDoc(doc(dbFirestore, 'providers', userId), newProvider);
        return { ...user, providerStatus: 'approved' };
    }
    return null;
  }
  
  async rejectProvider(userId: string): Promise<void> {
     await updateDoc(doc(dbFirestore, 'users', userId), { 
         role: UserRole.USER,
         providerStatus: 'rejected'
     });
  }
}

export const db = new DatabaseService();
