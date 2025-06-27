'use server';
import admin from 'firebase-admin';
import type { App } from 'firebase-admin/app';
import type { ServiceAccount } from 'firebase-admin';
import { cookies } from 'next/headers';

let adminApp: App | undefined;

function initializeAdminApp(): App {
  // Check if we've already initialized the app
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const encodedServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64;

  if (!encodedServiceAccount) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 environment variable is not set. Please check your .env.local file.');
  }

  try {
    const serviceAccountJson = Buffer.from(encodedServiceAccount, 'base64').toString('utf-8');
    const serviceAccount: ServiceAccount = JSON.parse(serviceAccountJson);

    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    
    return app;

  } catch (error: any) {
    console.error('Firebase Admin SDK Initialization Error:', error.message);
    throw new Error('Could not initialize Firebase Admin SDK. The service account JSON may be malformed or invalid. Please check your .env.local file.');
  }
}

// Initialize the app and export the auth and db instances.
const appInstance = initializeAdminApp();
const auth = admin.auth(appInstance);
const db = admin.firestore(appInstance);

// Session helper function to decode the session cookie.
async function getDecodedIdToken() {
  const sessionCookie = cookies().get('firebase-session')?.value;
  if (!sessionCookie) return null;

  try {
    const decodedIdToken = await auth.verifySessionCookie(sessionCookie, true);
    return decodedIdToken;
  } catch (error) {
    // Session cookie is invalid, expired, or revoked.
    return null;
  }
}

// Export the initialized instances and the session helper.
export { auth, db };

export const session = {
  getDecodedIdToken,
};
