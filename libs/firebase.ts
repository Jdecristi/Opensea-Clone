import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const apps = getApps();
let app;

// Initialize Firebase
if (!apps.length) {
   app = initializeApp(firebaseConfig);
}

export const DB = getFirestore();
export const Storage = getStorage();

export default app;
