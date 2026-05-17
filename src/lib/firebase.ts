import { initializeApp } from 'firebase/app';
import { getAuth, indexedDBLocalPersistence, initializeAuth } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp, 
  doc, 
  getDocFromServer,
  initializeFirestore
} from 'firebase/firestore';
// @ts-ignore
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Initialize Firestore with long polling to bypass certain network restrictions
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);

// Initialize Auth with cross-environment persistent storage
export const auth = initializeAuth(app, {
  persistence: indexedDBLocalPersistence
});

// Connectivity Test
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration or internet connection.");
    }
  }
}
testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const submitLead = async (data: { name: string; email: string; phone: string; service: string; message: string }) => {
  const path = 'leads';
  try {
    const docRef = await addDoc(collection(db, path), {
      ...data,
      status: 'new',
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const addProject = async (data: any) => {
  const path = 'projects';
  try {
    const docRef = await addDoc(collection(db, path), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const submitTestimonial = async (data: { name: string; role: string; quote: string; rating: number; location: string }) => {
  const path = 'testimonials';
  try {
    const docRef = await addDoc(collection(db, path), {
      ...data,
      status: 'pending', // Default to pending for moderation
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};
