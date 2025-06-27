import admin from 'firebase-admin';
import type { App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { cookies } from 'next/headers';

interface FirebaseAdmin {
    app: App;
    auth: Auth;
    db: Firestore;
}

// This is a more robust singleton pattern for Next.js server environments.
// It uses a global variable to ensure the instance is shared across hot reloads.
// This prevents inconsistent initialization that can occur in different server contexts.
const getFirebaseAdmin = (): FirebaseAdmin => {
    if ((globalThis as any).firebaseAdmin) {
        return (globalThis as any).firebaseAdmin;
    }

    const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
        throw new Error('Firebase Admin SDK environment variables are not set. Please check your .env.local file.');
    }
    
    try {
        const app = admin.apps.length 
            ? (admin.apps[0] as App)
            : admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
        
        const auth = getAuth(app);
        const db = getFirestore(app);

        (globalThis as any).firebaseAdmin = { app, auth, db };
        return (globalThis as any).firebaseAdmin;

    } catch (error: any) {
        console.error('CRITICAL: Firebase Admin SDK Initialization Failed.', error);
        throw new Error(`Could not initialize Firebase Admin SDK. The credential might be malformed. Error: ${error.message}`);
    }
}

const { auth, db } = getFirebaseAdmin();
export { auth, db };

export async function getDecodedIdToken() {
  const sessionCookie = cookies().get('firebase-session')?.value;
  if (!sessionCookie) return null;

  try {
    // We get the auth instance from our singleton to ensure it's initialized.
    const { auth } = getFirebaseAdmin();
    const decodedIdToken = await auth.verifySessionCookie(sessionCookie, true);
    return decodedIdToken;
  } catch (error) {
    // Session cookie is invalid, expired, or revoked.
    console.error('Session cookie verification failed:', error);
    return null;
  }
}
