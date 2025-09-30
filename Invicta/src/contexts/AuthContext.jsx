import { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider, db } from '../firebase/config';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  getDocs,
  setDoc, 
  updateDoc,
  collection, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('user'); // 'user', 'admin', or 'superadmin'
  const [adminRequestPending, setAdminRequestPending] = useState(false);

  // Create or update user profile
  async function createUserProfile(user) {
    if (!user) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', user.email));
      
      if (!userDoc.exists()) {
        // Create new user with default role 'user'
        await setDoc(doc(db, 'users', user.email), {
          email: user.email,
          name: user.displayName || 'Unknown',
          photoURL: user.photoURL || '',
          role: 'user', // Default role
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        });
        return 'user';
      } else {
        // Update last login
        await updateDoc(doc(db, 'users', user.email), {
          lastLogin: serverTimestamp()
        });
        return userDoc.data().role || 'user';
      }
    } catch (error) {
      console.error('Error creating/updating user profile:', error);
      return 'user';
    }
  }

  // Check if user has pending admin request
  async function checkPendingRequest(user) {
    if (!user) return false;
    
    try {
      const requestDoc = await getDoc(doc(db, 'adminRequests', user.email));
      return requestDoc.exists() && requestDoc.data().status === 'pending';
    } catch (error) {
      console.error('Error checking pending request:', error);
      return false;
    }
  }

  // Send admin access request
  async function requestAdminAccess(user) {
    if (!user) return false;
    
    try {
      // Add to admin requests collection
      await setDoc(doc(db, 'adminRequests', user.email), {
        email: user.email,
        name: user.displayName || 'Unknown',
        photoURL: user.photoURL || '',
        status: 'pending',
        requestedAt: serverTimestamp()
      });

      // Add to notifications for existing admins
      await addDoc(collection(db, 'notifications'), {
        type: 'admin_request',
        title: 'New Admin Access Request',
        message: `${user.displayName || user.email} is requesting admin access`,
        email: user.email,
        name: user.displayName || 'Unknown',
        createdAt: serverTimestamp(),
        read: false
      });

      setAdminRequestPending(true);
      return true;
    } catch (error) {
      console.error('Error requesting admin access:', error);
      return false;
    }
  }

  // Promote user to admin (called when request is approved)
  async function promoteToAdmin(email) {
    try {
      await updateDoc(doc(db, 'users', email), {
        role: 'admin',
        promotedAt: serverTimestamp()
      });
      
      if (currentUser && currentUser.email === email) {
        setUserRole('admin');
      }
      
      return true;
    } catch (error) {
      console.error('Error promoting user to admin:', error);
      return false;
    }
  }

  // Change user role (SuperAdmin only)
  async function changeUserRole(email, newRole, changedBy) {
    try {
      await updateDoc(doc(db, 'users', email), {
        role: newRole,
        roleChangedAt: serverTimestamp(),
        roleChangedBy: changedBy
      });
      
      // Add to role change log
      await addDoc(collection(db, 'roleChanges'), {
        email: email,
        previousRole: 'unknown', // We could fetch this if needed
        newRole: newRole,
        changedBy: changedBy,
        changedAt: serverTimestamp(),
        reason: `Role changed by SuperAdmin: ${changedBy}`
      });
      
      if (currentUser && currentUser.email === email) {
        setUserRole(newRole);
      }
      
      return true;
    } catch (error) {
      console.error('Error changing user role:', error);
      return false;
    }
  }

  // Get all users with their roles (SuperAdmin only)
  async function getAllUsers() {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      const users = [];
      
      snapshot.forEach((doc) => {
        users.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  function loginWithGoogle() {
    return signInWithPopup(auth, googleProvider);
  }

  function logout() {
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Create/update user profile and get role
        const role = await createUserProfile(user);
        const pendingRequest = await checkPendingRequest(user);
        
        setUserRole(role);
        setAdminRequestPending(pendingRequest);
      } else {
        setUserRole('user');
        setAdminRequestPending(false);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    isAdmin: userRole === 'admin' || userRole === 'superadmin',
    isSuperAdmin: userRole === 'superadmin',
    adminRequestPending,
    loginWithGoogle,
    logout,
    requestAdminAccess,
    promoteToAdmin,
    changeUserRole,
    getAllUsers,
    checkPendingRequest
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
