'use server';
import * as admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';
import { cookies } from 'next/headers';

if (!admin.apps.length) {
    const serviceAccount: ServiceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // The private key must have newlines replaced to be read from the .env file correctly
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
        throw new Error('Firebase Admin SDK environment variables are not set correctly in .env.local. Please check the file.');
    }

    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    } catch (error: any) {
        console.error('Firebase Admin SDK Initialization Error:', error.message);
        // Provide a more specific error message to help with debugging.
        throw new Error(`Could not initialize Firebase Admin SDK. The credential might be malformed. Error: ${error.message}`);
    }
}

const authAdminInstance = admin.auth();

async function getDecodedIdToken() {
    const sessionCookie = cookies().get('firebase-session')?.value;
    if (!sessionCookie) return null;

    try {
        const decodedIdToken = await authAdminInstance.verifySessionCookie(sessionCookie, true);
        return decodedIdToken;
    } catch (error) {
        // Session cookie is invalid or expired.
        return null;
    }
}

export const auth = authAdminInstance;

export const session = {
    getDecodedIdToken,
};
