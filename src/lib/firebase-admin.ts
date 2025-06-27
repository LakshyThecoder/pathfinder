import * as admin from 'firebase-admin';
import { cookies } from 'next/headers';

let app: admin.app.App;

// Check for required environment variables
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

const hasAdminConfig = projectId && clientEmail && privateKey;

if (!admin.apps.length) {
    if (hasAdminConfig) {
        try {
            app = admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey,
                }),
            });
        } catch (error: any) {
            console.error('Firebase Admin SDK initialization failed:', error.message);
        }
    } else {
        console.warn(
`[Firebase Admin] SDK NOT CONFIGURED. Server-side features will not work.
Reason: Missing one or more required environment variables.
- NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${projectId ? 'OK' : 'MISSING'}
- FIREBASE_CLIENT_EMAIL: ${clientEmail ? 'OK' : 'MISSING'}
- FIREBASE_PRIVATE_KEY: ${privateKey ? 'OK' : 'MISSING'}
You can get these from your Firebase project settings under "Service accounts".`
        );
    }
} else {
    app = admin.app();
}

async function getDecodedIdToken() {
    const session = cookies().get('firebase-session')?.value;
    if (!session) return null;

    // Avoid trying to verify if the SDK is not properly configured
    if (!app) {
      console.warn('[Firebase Admin] Cannot verify session cookie because Admin SDK is not configured.');
      return null;
    }

    try {
        const decodedIdToken = await admin.auth(app).verifySessionCookie(session, true);
        return decodedIdToken;
    } catch (error) {
        // This is a common error when the app restarts, don't need to be loud
        // console.error('Error verifying session cookie:', error);
        return null;
    }
}

const auth = {
    // By checking for `app`, we prevent a crash if the admin SDK is not initialized.
    // Methods like `createSessionCookie` will be undefined, leading to a runtime error
    // upon use, which is better than a build-time crash.
    ...(app ? admin.auth(app) : {}),
    getDecodedIdToken,
};

export { auth };
