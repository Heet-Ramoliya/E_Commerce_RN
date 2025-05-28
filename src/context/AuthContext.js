import React, {createContext, useState, useContext, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {auth, loginUser, registerUser, logoutUser} from '../config/firebase';
import {onAuthStateChanged} from 'firebase/auth';
import {doc, getDoc} from 'firebase/firestore';
import {db} from '../config/firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          const userData = userDoc.data();
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            ...userData,
          });
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const {user: firebaseUser, userData} = await loginUser(email, password);
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        ...userData,
      });
      return true;
    } catch (error) {
      setError(error.message);
      return false;
    }
  };

  const register = async (name, email, password) => {
    try {
      setError(null);
      const userData = {
        name,
        email,
      };
      const {user: firebaseUser, userData: createdUserData} = await registerUser(
        email,
        password,
        userData,
      );
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        ...createdUserData,
      });
      return true;
    } catch (error) {
      setError(error.message);
      return false;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAdmin,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};