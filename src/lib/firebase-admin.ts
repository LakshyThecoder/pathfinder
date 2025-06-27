'use server';
import * as admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';
import { cookies } from 'next/headers';

// This function ensures that we only initialize the app once, preventing errors in serverless environments.
const initializeAdminApp = () => {
    if (admin.apps.length > 0) {
        return admin.app();
    }

    const serviceAccount: ServiceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // The private key must have newlines replaced to be read from the .env file correctly
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    // Validate that all required service account properties are present.
    if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
        throw new Error('Firebase Admin SDK environment variables are not set correctly in .env.local. Please check the file.');
    }
    
    try {
        // Initialize the app with the constructed credential
        return admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    } catch (error: any) {
        console.error('Firebase Admin SDK Initialization Error:', error.message);
        // Provide a more specific error message to help with debugging.
        throw new Error(`Could not initialize Firebase Admin SDK. The credential might be malformed. Error: ${error.message}`);
    }
};

// Initialize the app and get the auth instance immediately.
// This instance will be cached by Node's module system and reused on subsequent imports.
const adminApp = initializeAdminApp();
const authAdminInstance = admin.auth(adminApp);

// Now, define the session logic using the initialized auth instance.
async function getDecodedIdToken() {
    const sessionCookie = cookies().get('firebase-session')?.value;
    if (!sessionCookie) return null;

    try {
        const decodedIdToken = await authAdminInstance.verifySessionCookie(sessionCookie, true);
        return decodedIdToken;
    } catch (error) {
        // Session cookie is invalid, expired, or revoked.
        return null;
    }
}

// Export the initialized auth instance and the session helper for use in other server-side files.
export const auth = authAdminInstance;

export const session = {
    getDecodedIdToken,
};