 # Mobile App Setup (Android)

This project uses [Capacitor](https://capacitorjs.com/) to wrap the Next.js web application into a native Android app.

## Prerequisites

1.  **Android Studio**: Download and install [Android Studio](https://developer.android.com/studio).
2.  **SDK Tools**: Ensure the Android SDK Command-line Tools are installed (via Android Studio SDK Manager).
3.  **Physical Device or Emulator**: Enable "USB Debugging" on your physical Android device, or create an emulator (AVD) in Android Studio.

## Configuration

Since this application uses Next.js **Server Actions** (backend logic running on the server), the Android app cannot simply serve static files. It must point to a running instance of the application (either your local dev server or the production URL).

### 1. Edit `capacitor.config.ts`

Open the `capacitor.config.ts` file in the root directory.

**For Local Development:**
Uncomment the local URL setting. This points the app to your computer's `localhost` (via the Android emulator's `10.0.2.2` alias).

```typescript
server: {
    url: "http://10.0.2.2:3000",
    cleartext: true, // Allows HTTP
    androidScheme: 'https'
}
```

*Note: You must have `npm run dev` running in your terminal for this to work.*

**For Production (Deployment):**
Set the URL to your live site (e.g., Netlify).

```typescript
server: {
    url: "https://your-neighbor-net.netlify.app", 
    androidScheme: 'https'
}
```

## Running the App

1.  **Sync Dependencies**:
    If you install new npm packages or change the config, run:
    ```bash
    npx cap sync
    ```

2.  **Open in Android Studio**:
    ```bash
    npx cap open android
    ```

3.  **Build & Run**:
    - In Android Studio, wait for Gradle sync to finish.
    - Select your device/emulator from the toolbar dropdown.
    - Click the **Run** (Green Play) button.

## Troubleshooting

-   **"Cleartext Traffic Permitted" Error**: Ensure `cleartext: true` is set in `capacitor.config.ts` if using `http` (localhost).
-   **Server Actions Failing**: Ensure your `url` points to the correct, accessible address. Only the production URL is reliable for genuine testing of all features.
