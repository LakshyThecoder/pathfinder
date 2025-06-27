'use server';
import admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';
import { cookies } from 'next/headers';

// Define a type for the global object to include our custom properties.
// This is a workaround to prevent re-initialization in Next.js hot-reloading environments.
declare global {
  var _firebaseAdminApp: admin.app.App | undefined;
}

const initializeAdminApp = (): admin.app.App => {
  // Use the cached app if it's already in the global scope.
  if (global._firebaseAdminApp) {
    return global._firebaseAdminApp;
  }

  // Fallback to the standard admin.apps check.
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const serviceAccount: ServiceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  // Validate that all required service account properties are present.
  if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
    throw new Error('Firebase Admin SDK environment variables are not set correctly in .env.local. Please check the file.');
  }

  try {
    const newApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    // Cache the initialized app in the global scope.
    global._firebaseAdminApp = newApp;
    return newApp;
  } catch (error: any) {
    console.error('Firebase Admin SDK Initialization Error:', error.message);
    throw new Error(`Could not initialize Firebase Admin SDK. The credential might be malformed. Error: ${error.message}`);
  }
};

const adminApp = initializeAdminApp();
const auth = admin.auth(adminApp);
const db = admin.firestore(adminApp);

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
