
# AmakenDahab Deployment Guide

This guide covers building the application for the Web, Android (Google Play), and iOS (App Store).

---

## 1. Prerequisites

Ensure you have the following installed:
1.  **Node.js** (v18+)
2.  **Android Studio** (for Android builds)
3.  **Xcode** (for iOS builds - Mac only)
4.  **Firebase CLI** (`npm install -g firebase-tools`)

---

## 2. Web Deployment (Firebase Hosting)

This will deploy the website version (PWA).

1.  **Login to Firebase:**
    ```bash
    firebase login
    ```

2.  **Initialize Hosting:**
    ```bash
    firebase init hosting
    # Select "Use an existing project" -> Choose your project
    # What do you want to use as your public directory? -> dist
    # Configure as a single-page app? -> Yes
    # Set up automatic builds and deploys with GitHub? -> No (unless you want CI/CD)
    ```

3.  **Build the Project:**
    ```bash
    npm run build
    ```

4.  **Deploy:**
    ```bash
    firebase deploy
    ```

---

## 3. Android Deployment (Google Play Store)

### Step A: Setup Capacitor
1.  **Build the web assets:**
    ```bash
    npm run build
    ```
2.  **Add Android platform:**
    ```bash
    npm install @capacitor/android
    npx cap add android
    ```
3.  **Sync assets:**
    ```bash
    npx cap sync android
    ```

### Step B: Generate Assets (Icons & Splash)
1.  Install the assets tool:
    ```bash
    npm install @capacitor/assets --save-dev
    ```
2.  Place your logo in `assets/logo.png` and `assets/logo-dark.png`.
3.  Generate icons:
    ```bash
    npx capacitor-assets generate --android
    ```

### Step C: Build & Sign in Android Studio
1.  **Open Android Studio:**
    ```bash
    npx cap open android
    ```
2.  Wait for Gradle to sync.
3.  **Versioning:**
    *   Go to `app/build.gradle`.
    *   Increment `versionCode` (integer, e.g., 1, 2, 3).
    *   Update `versionName` (string, e.g., "1.0.0").
4.  **Generate Signed Bundle:**
    *   Menu: **Build > Generate Signed Bundle / APK**.
    *   Select **Android App Bundle**.
    *   **Key Store Path:** Create new. Save it safely (do not lose this!).
    *   Fill in passwords and certificate info.
    *   Select **Release** build variant.
    *   Click **Finish**.

### Step D: Upload to Google Play Console
1.  Go to [Google Play Console](https://play.google.com/console).
2.  Create App.
3.  Upload the `.aab` file generated in `android/app/release/`.
4.  Fill out store listing (Screenshots, Description).
5.  Submit for Review.

---

## 4. iOS Deployment (Apple App Store)

*Note: Requires a Mac.*

### Step A: Setup Capacitor
1.  **Build web assets:**
    ```bash
    npm run build
    ```
2.  **Add iOS platform:**
    ```bash
    npm install @capacitor/ios
    npx cap add ios
    ```
3.  **Sync assets:**
    ```bash
    npx cap sync ios
    ```

### Step B: Generate Assets
```bash
npx capacitor-assets generate --ios
```

### Step C: Build in Xcode
1.  **Open Xcode:**
    ```bash
    npx cap open ios
    ```
2.  **Signing:**
    *   Click on the "App" project on the left.
    *   Go to **Signing & Capabilities**.
    *   Select your **Team** (Apple Developer Account).
    *   Ensure **Bundle Identifier** matches your App Store Connect entry (e.g., `com.amakendahab.app`).
3.  **Versioning:**
    *   In the **General** tab, update **Version** and **Build**.
4.  **Archive:**
    *   Select "Any iOS Device (arm64)" as the target.
    *   Menu: **Product > Archive**.
5.  **Distribute:**
    *   Once archived, the Organizer window opens.
    *   Click **Distribute App**.
    *   Select **App Store Connect**.
    *   Follow the prompts to upload.

### Step D: App Store Connect
1.  Go to [App Store Connect](https://appstoreconnect.apple.com).
2.  Go to **My Apps** > Select App.
3.  The build you uploaded via Xcode will appear in "TestFlight" processing.
4.  Once processed, add it to the **Production** section.
5.  Submit for Review.

---

## 5. Important Considerations

1.  **API Keys:** Ensure your `google-services.json` (Android) and `GoogleService-Info.plist` (iOS) are inside the respective platform folders (`android/app/` and `ios/App/App/`) if using Firebase Push Notifications or Auth natively.
2.  **Permissions:** Check `metadata.json` or `AndroidManifest.xml` / `Info.plist` to ensure you are only requesting permissions you actually use (Camera, Location), otherwise Apple/Google may reject the app.
3.  **Domain Verification:** For Social Login (Google/Facebook) to work on native devices, you often need to whitelist the native app package names in the Google Cloud Console / Facebook Developers Console.
