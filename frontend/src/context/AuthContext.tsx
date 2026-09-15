import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  db,
  doc,
  getDoc,
  setDoc,
  isFirebaseConfigured, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile,
  googleProvider,
  signInWithPopup
} from '../lib/firebase';
import type { UserProfile, SignUpFormData, SignInFormData, UserRole } from '../types/auth';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  isDemoMode: boolean;
  signup: (data: SignUpFormData, role?: UserRole) => Promise<void>;
  login: (data: SignInFormData, role?: UserRole) => Promise<void>;
  loginWithGoogle: (role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeRole = (role?: string): UserRole => {
  if (!role) return 'student';
  const lower = role.toLowerCase();
  if (lower === 'company' || lower === 'industry') return 'company';
  if (lower === 'college' || lower === 'academia') return 'college';
  return 'student';
};

/**
  Firestore Authoritative User Role Helper: Reads role from users/{uid}
 */
async function fetchAuthoritativeRole(uid: string): Promise<UserRole | null> {
  if (!db) return null;
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await Promise.race([
      getDoc(userDocRef),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 1500))
    ]);
    if (snap && snap.exists() && snap.data()?.role) {
      return normalizeRole(snap.data().role);
    }
  } catch (err) {
    console.warn('Unable to fetch user role from Firestore:', err);
  }
  return null;
}

/**
  Firestore Authoritative User Role Helper: Writes role to users/{uid}
 */
async function saveAuthoritativeRole(uid: string, data: { role: UserRole; email: string; name: string; college?: string; course?: string }) {
  if (!db) return;
  try {
    const userDocRef = doc(db, 'users', uid);
    await Promise.race([
      setDoc(userDocRef, {
        role: data.role,
        email: data.email,
        name: data.name,
        ...(data.college ? { college: data.college } : {}),
        ...(data.course ? { course: data.course } : {}),
        updatedAt: new Date().toISOString(),
      }, { merge: true }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 1500))
    ]);
  } catch (err) {
    console.warn('Unable to write user role to Firestore:', err);
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const isDemoMode = !isFirebaseConfigured || !auth;

  useEffect(() => {
    let mounted = true;
    // Safety fallback timer to ensure loading screen never hangs indefinitely
    const fallbackTimer = setTimeout(() => {
      if (mounted) {
        setLoading(false);
      }
    }, 1200);

    if (auth) {
      const unsubscribe = auth.onAuthStateChanged(async (fbUser) => {
        try {
          if (fbUser) {
            let role: UserRole = 'student';
            const firestoreRole = await fetchAuthoritativeRole(fbUser.uid);
            if (firestoreRole) {
              role = firestoreRole;
            } else {
              const cachedExtra = localStorage.getItem(`sb_user_${fbUser.uid}`);
              if (cachedExtra) {
                try {
                  const parsed = JSON.parse(cachedExtra);
                  if (parsed.role) role = normalizeRole(parsed.role);
                } catch (e) { /* ignore */ }
              }
              await saveAuthoritativeRole(fbUser.uid, {
                role,
                email: fbUser.email || '',
                name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User'
              });
            }

            const name = fbUser.displayName || fbUser.email?.split('@')[0] || 'User';
            const userObj: UserProfile = {
              id: fbUser.uid,
              uid: fbUser.uid,
              email: fbUser.email || '',
              name,
              displayName: name,
              role,
              createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
            };
            if (mounted) setUser(userObj);
            localStorage.setItem(`sb_user_${fbUser.uid}`, JSON.stringify({ displayName: name, name, role }));
          } else {
            if (mounted) setUser(null);
          }
        } catch (e) {
          console.warn('Auth state check error:', e);
        } finally {
          if (mounted) setLoading(false);
          clearTimeout(fallbackTimer);
        }
      });
      return () => {
        mounted = false;
        clearTimeout(fallbackTimer);
        unsubscribe();
      };
    } else {
      setLoading(false);
      clearTimeout(fallbackTimer);
    }
  }, []);

  const clearError = () => setError(null);

  const loginWithGoogle = async (requestedRole: UserRole = 'student') => {
    setError(null);
    setLoading(true);
    const role = normalizeRole(requestedRole);

    try {
      if (auth) {
        try {
          const result = await signInWithPopup(auth, googleProvider);
          const fbUser = result.user;
          const name = fbUser.displayName || fbUser.email?.split('@')[0] || 'Google User';

          let userRole = await fetchAuthoritativeRole(fbUser.uid);
          if (!userRole) {
            userRole = role;
            await saveAuthoritativeRole(fbUser.uid, {
              role: userRole,
              email: fbUser.email || '',
              name,
            });
          }

          const userObj: UserProfile = {
            id: fbUser.uid,
            uid: fbUser.uid,
            email: fbUser.email || '',
            name,
            displayName: name,
            role: userRole,
            createdAt: new Date().toISOString()
          };
          localStorage.setItem(`sb_user_${fbUser.uid}`, JSON.stringify({ displayName: name, name, role: userRole }));
          setUser(userObj);
          return;
        } catch (fbErr: any) {
          if (
            fbErr.code === 'auth/invalid-api-key' ||
            fbErr.code === 'auth/api-key-not-valid' ||
            fbErr.code === 'auth/popup-closed-by-user' ||
            fbErr.code === 'auth/network-request-failed' ||
            fbErr.code === 'auth/internal-error' ||
            (fbErr.message && fbErr.message.includes('API key'))
          ) {
            console.warn('Google sign-in fallback activated:', fbErr);
            const mockId = 'google-' + Math.random().toString(36).substring(2, 9);
            const name = 'Google User';
            const userObj: UserProfile = {
              id: mockId,
              uid: mockId,
              email: 'google.user@example.com',
              name,
              displayName: name,
              role,
              createdAt: new Date().toISOString()
            };
            localStorage.setItem(`sb_user_${mockId}`, JSON.stringify({ displayName: name, name, role }));
            setUser(userObj);
            return;
          }
          throw fbErr;
        }
      } else {
        const mockId = 'google-' + Math.random().toString(36).substring(2, 9);
        const name = 'Google User';
        const userObj: UserProfile = {
          id: mockId,
          uid: mockId,
          email: 'google.user@example.com',
          name,
          displayName: name,
          role,
          createdAt: new Date().toISOString()
        };
        localStorage.setItem(`sb_user_${mockId}`, JSON.stringify({ displayName: name, name, role }));
        setUser(userObj);
      }
    } catch (err: any) {
      let msg = 'Google Sign-In failed. Please try again.';
      if (err.message) msg = err.message;
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (data: SignUpFormData, requestedRole: UserRole = 'student') => {
    setError(null);
    setLoading(true);
    const role = normalizeRole(requestedRole);

    try {
      if (auth) {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
          await updateProfile(userCredential.user, {
            displayName: data.fullName
          });

          await saveAuthoritativeRole(userCredential.user.uid, {
            role,
            email: data.email,
            name: data.fullName,
            college: data.college,
            course: data.course
          });

          const userObj: UserProfile = {
            id: userCredential.user.uid,
            uid: userCredential.user.uid,
            email: userCredential.user.email || data.email,
            name: data.fullName,
            displayName: data.fullName,
            college: data.college,
            course: data.course,
            role,
            createdAt: new Date().toISOString()
          };
          localStorage.setItem(`sb_user_${userCredential.user.uid}`, JSON.stringify({ displayName: data.fullName, name: data.fullName, role }));
          setUser(userObj);
          return;
        } catch (fbErr: any) {
          if (
            fbErr.code === 'auth/invalid-api-key' ||
            fbErr.code === 'auth/api-key-not-valid' ||
            fbErr.code === 'auth/network-request-failed' ||
            fbErr.code === 'auth/internal-error' ||
            (fbErr.message && fbErr.message.includes('API key'))
          ) {
            console.warn('Firebase signup fallback activated:', fbErr);
            const mockId = 'usr_' + Math.random().toString(36).substring(2, 9);
            const userObj: UserProfile = {
              id: mockId,
              uid: mockId,
              email: data.email,
              name: data.fullName,
              displayName: data.fullName,
              college: data.college,
              course: data.course,
              role,
              createdAt: new Date().toISOString()
            };
            localStorage.setItem(`sb_user_${mockId}`, JSON.stringify({ displayName: data.fullName, name: data.fullName, role }));
            setUser(userObj);
            return;
          }
          throw fbErr;
        }
      } else {
        const mockId = 'usr_' + Math.random().toString(36).substring(2, 9);
        const userObj: UserProfile = {
          id: mockId,
          uid: mockId,
          email: data.email,
          name: data.fullName,
          displayName: data.fullName,
          college: data.college,
          course: data.course,
          role,
          createdAt: new Date().toISOString()
        };
        localStorage.setItem(`sb_user_${mockId}`, JSON.stringify({ displayName: data.fullName, name: data.fullName, role }));
        setUser(userObj);
      }
    } catch (err: any) {
      let msg = 'Failed to create account. Please check your information.';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this email address already exists.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Invalid email address format.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: SignInFormData, requestedRole: UserRole = 'student') => {
    setError(null);
    setLoading(true);
    const role = normalizeRole(requestedRole);

    try {
      if (auth) {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
          const fbUser = userCredential.user;
          const name = fbUser.displayName || data.email.split('@')[0] || 'User';

          let fetchedRole = await fetchAuthoritativeRole(fbUser.uid);
          if (!fetchedRole) {
            fetchedRole = role;
            await saveAuthoritativeRole(fbUser.uid, {
              role: fetchedRole,
              email: data.email,
              name,
            });
          }

          const userObj: UserProfile = {
            id: fbUser.uid,
            uid: fbUser.uid,
            email: fbUser.email || data.email,
            name,
            displayName: name,
            role: fetchedRole,
            createdAt: new Date().toISOString(),
          };
          localStorage.setItem(`sb_user_${fbUser.uid}`, JSON.stringify({ displayName: name, name, role: fetchedRole }));
          setUser(userObj);
          return;
        } catch (fbErr: any) {
          if (
            fbErr.code === 'auth/invalid-api-key' ||
            fbErr.code === 'auth/api-key-not-valid' ||
            fbErr.code === 'auth/network-request-failed' ||
            fbErr.code === 'auth/internal-error' ||
            (fbErr.message && fbErr.message.includes('API key'))
          ) {
            console.warn('Firebase login fallback activated:', fbErr);
            const mockId = 'usr_' + Math.random().toString(36).substring(2, 9);
            const name = data.email.split('@')[0] || 'User';
            const userObj: UserProfile = {
              id: mockId,
              uid: mockId,
              email: data.email,
              name,
              displayName: name,
              role,
              createdAt: new Date().toISOString(),
            };
            localStorage.setItem(`sb_user_${mockId}`, JSON.stringify({ displayName: name, name, role }));
            setUser(userObj);
            return;
          }
          throw fbErr;
        }
      } else {
        const mockId = 'usr_' + Math.random().toString(36).substring(2, 9);
        const name = data.email.split('@')[0] || 'User';
        const userObj: UserProfile = {
          id: mockId,
          uid: mockId,
          email: data.email,
          name,
          displayName: name,
          role,
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem(`sb_user_${mockId}`, JSON.stringify({ displayName: name, name, role }));
        setUser(userObj);
      }
    } catch (err: any) {
      let msg = 'Failed to sign in. Please check your credentials.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Invalid email or password.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Invalid email address format.';
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (auth) {
        await signOut(auth);
      }
    } catch (err: any) {
      // ignore firebase signout errors
    } finally {
      // Clear ONLY authentication session state (do NOT clear student profile data)
      setUser(null);
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setError(null);
    if (!email) throw new Error('Please enter your email address.');

    try {
      if (auth) {
        await sendPasswordResetEmail(auth, email);
      } else {
        throw new Error('Authentication service unavailable.');
      }
    } catch (err: any) {
      let msg = 'Failed to send password reset email.';
      if (err.code === 'auth/user-not-found') {
        msg = 'No user account found with this email.';
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
      throw new Error(msg);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      isDemoMode, 
      signup, 
      login, 
      loginWithGoogle,
      logout, 
      resetPassword, 
      clearError 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


