import * as admin from 'firebase-admin';
import { cookies } from 'next/headers';

let app: admin.app.App;

// Check for required environment variables
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!admin.apps.length) {
    if (projectId && clientEmail && privateKey) {
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
            // Initialize a dummy app to prevent crashes on subsequent calls
            app = admin.initializeApp();
        }
    } else {
        console.warn(
`[Firebase Admin] SDK not configured. Server-side features like session management will not work.
Please ensure the following environment variables are set in your .env file:
- NEXT_PUBLIC_FIREBASE_PROJECT_ID
- FIREBASE_CLIENT_EMAIL
- FIREBASE_PRIVATE_KEY
You can get these from your Firebase project settings under "Service accounts".`
        );
        // Initialize a dummy app to prevent crashes on subsequent calls
        app = admin.initializeApp();
    }
} else {
    app = admin.app();
}

async function getDecodedIdToken() {
    const session = cookies().get('firebase-session')?.value;
    if (!session) return null;

    // Avoid trying to verify if the SDK is not properly configured
    if (!admin.apps[0]?.options.credential) {
      console.warn('[Firebase Admin] Cannot verify session cookie because Admin SDK is not configured.');
      return null;
    }

    try {
        const decodedIdToken = await admin.auth().verifySessionCookie(session, true);
        return decodedIdToken;
    } catch (error) {
        // This is a common error when the app restarts, don't need to be loud
        // console.error('Error verifying session cookie:', error);
        return null;
    }
}

const auth = {
    ...admin.auth(app),
    getDecodedIdToken,
};

export { auth };
