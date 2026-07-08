import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Admin emails (also enforced server-side by the Firestore security rules)
const ADMIN_EMAILS = ['mahmoudgamal442004@gmail.com', 'adham@123365.com'];

export type UserRole = 'admin' | 'candidate' | 'company';

interface AuthContextType {
  currentUser: User | null;
  userRole: UserRole | null;
  loading: boolean;
  loginWithGoogle: (role?: UserRole) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function friendlyAuthError(error: any): Error {
  const code = error?.code || '';
  const messages: Record<string, string> = {
    'auth/invalid-credential': 'Incorrect email or password.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect email or password.',
    'auth/email-already-in-use': 'An account with this email already exists. Try signing in instead.',
    'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/popup-closed-by-user': 'The sign-in popup was closed before completing.'
  };
  return new Error(messages[code] || error?.message || 'Authentication failed. Please try again.');
}

// Single source of truth for the Firestore user document.
// Creates the document on first sign-in and returns the effective role.
// Never writes 'admin' unless the email is whitelisted — the deployed
// Firestore rules reject an 'admin' role for any other email.
async function syncUserToFirestore(user: User, requestedRole: UserRole): Promise<UserRole> {
  const isWhitelistedAdmin = !!user.email && ADMIN_EMAILS.includes(user.email);
  const userDocRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);

  if (!userDoc.exists()) {
    const role: UserRole = isWhitelistedAdmin
      ? 'admin'
      : (requestedRole === 'admin' ? 'candidate' : requestedRole);
    await setDoc(userDocRef, {
      role,
      email: user.email,
      name: user.displayName || user.email?.split('@')[0] || 'User',
      photoURL: user.photoURL || null,
      createdAt: new Date().toISOString()
    });
    return role;
  }

  const existingRole = (userDoc.data().role as UserRole) || 'candidate';
  if (isWhitelistedAdmin && existingRole !== 'admin') {
    await setDoc(userDocRef, { role: 'admin' }, { merge: true });
    return 'admin';
  }
  return existingRole;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  // Role requested at sign-in time; applied only when creating a NEW user document.
  const pendingRoleRef = useRef<UserRole>('candidate');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const role = await syncUserToFirestore(user, pendingRoleRef.current);
          setUserRole(role);
        } catch (error) {
          console.error('[AuthContext] Failed to sync user to Firestore:', error);
          // Do NOT set a fake role. If the DB sync fails, the user has no role.
          setUserRole(null);
        } finally {
          pendingRoleRef.current = 'candidate';
        }
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const loginWithGoogle = async (role: UserRole = 'candidate') => {
    pendingRoleRef.current = role;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // onAuthStateChanged performs the Firestore sync exactly once.
    } catch (error) {
      pendingRoleRef.current = 'candidate';
      throw friendlyAuthError(error);
    }
  };

  // Sign-in only. Never auto-creates an account: 'auth/invalid-credential'
  // also fires for a wrong password, so auto-creating here was a logic bug.
  const loginWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw friendlyAuthError(error);
    }
  };

  const registerWithEmail = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw friendlyAuthError(error);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    currentUser,
    userRole,
    loading,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
