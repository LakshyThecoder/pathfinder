'use server';
import admin from 'firebase-admin';
import type { App } from 'firebase-admin/app';
import type { ServiceAccount } from 'firebase-admin';
import { cookies } from 'next/headers';

// This function ensures that the Firebase Admin SDK is initialized only once.
function initializeAdminApp(): App {
  // Check if an app is already initialized, and return it.
  if (admin.apps.length > 0) {
    // This is safe to do, as admin.app() will throw if no app is initialized.
    return admin.app();
  }

  // If not initialized, create the service account object from environment variables.
  const serviceAccount: ServiceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // The private key from the environment variable needs to have its newlines restored.
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  // Validate that all required service account properties are present.
  if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
    throw new Error('Firebase Admin SDK environment variables are not set correctly. Please check your .env.local file.');
  }
  
  // Initialize the app with the credentials.
  try {
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error: any) {
    console.error('Firebase Admin SDK Initialization Error:', error.message);
    // Provide a more specific error message to help with debugging.
    throw new Error(`Could not initialize Firebase Admin SDK. The credential might be malformed. Error: ${error.message}`);
  }
};

// Initialize the app and export the auth and db instances.
const adminApp = initializeAdminApp();
const auth = admin.auth(adminApp);
const db = admin.firestore(adminApp);

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
