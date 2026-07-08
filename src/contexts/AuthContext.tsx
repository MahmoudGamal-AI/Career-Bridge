import React, { createContext, useContext, useEffect, useState } from 'react';
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

// Admin emails (Hardcoded for simplicity, but handled securely in Firestore rules)
const ADMIN_EMAILS = ['mahmoudgamal442004@gmail.com', 'adham@123365.com'];

interface AuthContextType {
  currentUser: User | null;
  userRole: 'admin' | 'candidate' | 'company' | null;
  loading: boolean;
  loginWithGoogle: (role?: 'candidate' | 'company' | 'admin') => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'candidate' | 'company' | null>(null);
  const [loading, setLoading] = useState(true);

  // Unified function to sync user data with Firestore
  const syncUserToFirestore = async (user: User, defaultRole: 'candidate' | 'company' | 'admin' = 'candidate') => {
    console.log(`[AuthContext] Syncing user ${user.uid} to Firestore...`);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      let finalRole = defaultRole;
      
      // If email matches our admin list, ALWAYS assign admin role.
      if (user.email && ADMIN_EMAILS.includes(user.email)) {
        finalRole = 'admin';
      }

      if (!userDoc.exists()) {
        console.log(`[AuthContext] Creating new user document in Firestore with role: ${finalRole}`);
        await setDoc(userDocRef, {
          role: finalRole,
          email: user.email,
          name: user.displayName || user.email?.split('@')[0] || "User",
          photoURL: user.photoURL,
          createdAt: new Date().toISOString()
        });
        setUserRole(finalRole);
      } else {
        console.log(`[AuthContext] User document exists.`);
        let existingRole = userDoc.data().role;
        
        // Force upgrade to admin if email matches and role isn't admin
        if (finalRole === 'admin' && existingRole !== 'admin') {
           console.log(`[AuthContext] Upgrading user to admin role.`);
           existingRole = 'admin';
           await setDoc(userDocRef, { role: 'admin' }, { merge: true });
        }
        
        setUserRole(existingRole);
      }
      console.log(`[AuthContext] Sync successful. Final role:`, userRole);
    } catch (error: any) {
      console.error("[AuthContext] 🔥 CRITICAL: Failed to sync user to Firestore!", error);
      // DO NOT set fake roles. If DB fails, they have NO role.
      setUserRole(null);
      throw new Error(`Database connection failed: ${error.message}`);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log(`[AuthContext] onAuthStateChanged fired. User:`, user ? user.uid : 'null');
      setCurrentUser(user);
      if (user) {
        try {
          await syncUserToFirestore(user);
        } catch (error) {
          // Error already logged in syncUserToFirestore
        }
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const loginWithGoogle = async (role: 'candidate' | 'company' | 'admin' = 'candidate') => {
    console.log(`[AuthContext] loginWithGoogle called with requested role:`, role);
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    // The onAuthStateChanged listener will handle the Firestore sync, 
    // but we can explicitly call sync here to ensure the requested role is passed for new users.
    await syncUserToFirestore(result.user, role);
  };

  const loginWithEmail = async (email: string, password: string) => {
    console.log(`[AuthContext] loginWithEmail called for:`, email);
    let userCredential;
    try {
      userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log(`[AuthContext] Signed in existing user successfully.`);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        console.log(`[AuthContext] User not found, creating new account...`);
        try {
          userCredential = await createUserWithEmailAndPassword(auth, email, password);
        } catch (createError) {
          console.error(`[AuthContext] Failed to create new account:`, createError);
          throw createError;
        }
      } else {
        console.error(`[AuthContext] Sign in failed:`, error);
        throw error;
      }
    }

    // Explicitly sync to ensure admin role is applied correctly immediately.
    await syncUserToFirestore(userCredential.user, 'admin');
  };

  const logout = async () => {
    console.log(`[AuthContext] Logging out...`);
    await signOut(auth);
  };

  const value = {
    currentUser,
    userRole,
    loading,
    loginWithGoogle,
    loginWithEmail,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
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
