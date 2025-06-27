import admin from 'firebase-admin';
import type { App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { cookies } from 'next/headers';

/**
 * Initializes the Firebase Admin SDK, ensuring it's only done once.
 * This is the recommended pattern for Next.js server environments.
 */
function initializeAdminApp(): App {
  // Check if an app is already initialized
  if (admin.apps.length > 0) {
    return admin.apps[0] as App;
  }

  const encodedServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64;
  
  if (!encodedServiceAccount) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 environment variable is not set. The server cannot start without it. Check your .env.local file.');
  }

  try {
    const serviceAccountJson = Buffer.from(encodedServiceAccount, 'base64').toString('utf-8');
    const serviceAccount = JSON.parse(serviceAccountJson);

    // Initialize the app with the credentials
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

  } catch (error: any) {
    console.error('CRITICAL: Firebase Admin SDK Initialization Failed.', error);
    if (error.code === 'ERR_INVALID_ARG_TYPE' || error.message.includes('malformed')) {
        throw new Error('Could not initialize Firebase Admin SDK. The service account JSON is likely malformed or missing required fields. Please verify the content of your FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 variable in .env.local.');
    }
    throw new Error(`Could not initialize Firebase Admin SDK. A critical error occurred: ${error.message}`);
  }
}

// Initialize the app and export the authenticated services
const appInstance = initializeAdminApp();
export const auth = getAuth(appInstance);
export const db = getFirestore(appInstance);

/**
 * Verifies the session cookie from the incoming request.
 * @returns The decoded ID token if the session is valid, otherwise null.
 */
export async function getDecodedIdToken() {
  const sessionCookie = cookies().get('firebase-session')?.value;
  if (!sessionCookie) return null;

  try {
    // Verify the session cookie. This will also check if it's been revoked.
    const decodedIdToken = await auth.verifySessionCookie(sessionCookie, true);
    return decodedIdToken;
  } catch (error) {
    // Session cookie is invalid, expired, or revoked.
    return null;
  }
}
