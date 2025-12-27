
# AmakenDahab - Developer & Agent Context

## 1. Project Overview
AmakenDahab is a "Super App" for the city of Dahab, Egypt. It functions as a PWA (Progressive Web App) and a native mobile app (via Capacitor).
**Core Value:** Connecting locals, tourists, and expats with events, drivers, and services.

## 2. Tech Stack
*   **Framework:** React 18 (Vite)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS (Mobile-first approach)
*   **Icons:** `lucide-react` (Do not use other icon libraries)
*   **Native Wrapper:** Capacitor (for Android/iOS)
*   **Backend:** Firebase (Auth, Firestore, Storage) with a `MockDatabaseService` fallback for offline/demo development.
*   **Maps:** Leaflet (OpenStreetMap)

## 3. Architecture & Patterns

### Service Layer Pattern
The app uses a strict Service Layer pattern to abstract backend logic.
*   **Location:** `services/database.ts` (Production/Firebase) and `services/mockDatabase.ts` (Dev/Demo).
*   **Usage:** Components import `db` from `services/database`.
*   **Rule:** Never call Firebase SDKs directly inside UI components. Always create a method in the `DatabaseService` class.

### Context API for Global State
*   **`SettingsContext`:** Handles app-wide configuration (Logo, App Name, Navigation, Colors, Language). This allows the app to be "CMS-like" where admins can edit the UI live.

### Mobile-First Design System
*   **Safe Areas:** Must use `.pt-safe`, `.pb-safe`, etc., defined in `index.html` to handle Notches and Home Indicators on mobile devices.
*   **Touch Targets:** Buttons must be large enough for thumbs (min 44px).
*   **Scroll:** Use `.no-scrollbar` class for horizontal scroll containers to keep UI clean.

## 4. Key Data Models (See `types.ts`)
*   **User:** Roles (`ADMIN`, `PROVIDER`, `USER`).
*   **Event:** Date, Time, Location, Coordinates, Category (Party, Hike, etc.).
*   **ServiceProvider:** Driver, Cleaner, Restaurant, etc.
*   **Booking:** Transactions between users and providers/events.

## 5. Coding Rules for Agents
1.  **Stability:** Do not remove existing imports unless replacing them.
2.  **Icons:** Always use `lucide-react`.
3.  **Responsiveness:** Always test layouts on mobile widths (375px) and desktop (1024px+).
4.  **Mock Data:** If adding a new feature, ensure it works in `mockDatabase.ts` first.
5.  **Editability:** If building a UI section (Hero, Text Block), try to use the `<Editable />` component to allow Admins to change text/images live.

## 6. Environment Variables
*   `VITE_FIREBASE_API_KEY`: Firebase Config.
*   `API_KEY`: Google Gemini API Key.
*   Accessed via `process.env.VARIABLE_NAME` (configured in `vite.config.ts`).
