'use server';
import admin from 'firebase-admin';
import type { App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { cookies } from 'next/headers';

// Define a type for the global object to avoid TypeScript errors
declare global {
  var _firebaseAdminApp: App | undefined;
}

function initializeAdminApp(): App {
  // Use a global variable to store the app instance in development to prevent re-initialization on hot reloads.
  if (process.env.NODE_ENV === 'development' && global._firebaseAdminApp) {
    return global._firebaseAdminApp;
  }

  // Check the official admin.apps array which is the recommended way for production.
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

    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    // Store the initialized app on the global object in development.
    if (process.env.NODE_ENV === 'development') {
      global._firebaseAdminApp = app;
    }
    
    return app;

  } catch (error: any) {
    console.error('CRITICAL: Firebase Admin SDK Initialization Failed.', error);
    if (error.code === 'ERR_INVALID_ARG_TYPE' || error.message.includes('malformed')) {
        throw new Error('Could not initialize Firebase Admin SDK. The service account JSON is likely malformed or missing required fields. Please verify the content of your FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 variable in .env.local.');
    }
    throw new Error(`Could not initialize Firebase Admin SDK. A critical error occurred: ${error.message}`);
  }
}

const appInstance = initializeAdminApp();
const auth = getAuth(appInstance);
const db = getFirestore(appInstance);

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

export { auth, db };

export const session = {
  getDecodedIdToken,
};
