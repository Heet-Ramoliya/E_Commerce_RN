import React, {createContext, useState, useContext, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';
import {auth, db} from '../config/firebase';
import {showToast} from '../components/Toast';
import {emailRegex, passwordRegex} from '../utilities/helper';
import {doc, getDoc, setDoc} from '@react-native-firebase/firestore';
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from '@react-native-firebase/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
      try {
        if (firebaseUser) {
          let userData;
          const userDoc = await getDoc(doc(db, 'Users', firebaseUser.uid));
          if (userDoc.exists()) {
            userData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              ...userDoc.data(),
            };
          } else {
            await signOut(auth);
            setUser(null);
            await AsyncStorage.removeItem('user');
            return;
          }

          setUser(userData);
          try {
            await AsyncStorage.setItem('user', JSON.stringify(userData));
          } catch (storageError) {
            console.error(
              'Failed to save user to AsyncStorage in onAuthStateChanged:',
              storageError,
            );
          }
        } else {
          console.log('No Firebase user, clearing AsyncStorage');
          setUser(null);
          await AsyncStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Auth state sync error:', error);
        showToast({
          type: 'error',
          title: 'Auth Error',
          message: 'Failed to sync user data.',
        });
        setUser(null);
        await AsyncStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    });

    const loadCachedUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Failed to load cached user:', error);
      }
    };

    loadCachedUser();

    return () => unsubscribe();
  }, []);

  const uploadImageToCloudinary = async image => {
    if (!image) return null;
    const formData = new FormData();
    formData.append('file', {
      uri: image.uri,
      type: image.type || 'image/jpeg',
      name: image.fileName || 'profile.jpg',
    });
    formData.append('upload_preset', 'profile_pictures');
    formData.append('cloud_name', Config.CLOUDINARY_CLOUD_NAME);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${Config.CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        },
      );
      const data = await response.json();
      if (data.secure_url) {
        showToast({
          type: 'success',
          title: 'Image Uploaded',
          message: 'Profile picture uploaded successfully.',
        });
        return data.secure_url;
      } else {
        throw new Error('Image upload failed');
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Image Upload Failed',
        message: 'Failed to upload profile picture.',
      });
      return null;
    }
  };

  const login = async (email, password) => {
    setAuthLoading(true);
    try {
      if (!email || !emailRegex.test(email)) {
        showToast({
          type: 'error',
          title: 'Invalid Email',
          message: 'Please enter a valid email address.',
        });
        return {success: false};
      }
      if (!password || password.length < 8) {
        showToast({
          type: 'error',
          title: 'Invalid Password',
          message: 'Password must be at least 8 characters long.',
        });
        return {success: false};
      }

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const firebaseUser = userCredential.user;

      let userData;
      const userDoc = await getDoc(doc(db, 'Users', firebaseUser.uid));
      if (userDoc.exists()) {
        userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          ...userDoc.data(),
        };
      } else {
        console.error('No Firestore document for user:', firebaseUser.uid);
        showToast({
          type: 'error',
          title: 'Profile Error',
          message: 'User profile not found. Please contact support.',
        });
        await signOut(auth);
        return {success: false};
      }

      try {
        await AsyncStorage.setItem('user', JSON.stringify(userData));
      } catch (storageError) {
        console.error('Failed to save user to AsyncStorage:', storageError);
        showToast({
          type: 'error',
          title: 'Storage Error',
          message: 'Failed to save user data. Please try again.',
        });
      }

      setUser(userData);
      showToast({
        type: 'success',
        title: 'Login Successful',
        message: `Welcome back, ${userData.firstName}!`,
      });
      return {success: true};
    } catch (error) {
      let errorMessage = 'Failed to log in.';
      switch (error.code) {
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many attempts. Please try again later.';
          break;
        default:
          console.error('Login error:', error);
      }
      showToast({
        type: 'error',
        title: 'Login Error',
        message: errorMessage,
      });
      return {success: false};
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (
    firstName,
    lastName,
    gender,
    email,
    password,
    confirmPassword,
    profilePic,
  ) => {
    setAuthLoading(true);
    try {
      if (!firstName || firstName.length < 2) {
        showToast({
          type: 'error',
          title: 'Invalid First Name',
          message: 'First name must be at least 2 characters.',
        });
        return false;
      }
      if (!lastName || lastName.length < 2) {
        showToast({
          type: 'error',
          title: 'Invalid Last Name',
          message: 'Last name must be at least 2 characters.',
        });
        return false;
      }
      if (!gender) {
        showToast({
          type: 'error',
          title: 'Gender Required',
          message: 'Please select a gender.',
        });
        return false;
      }
      if (!email || !emailRegex.test(email)) {
        showToast({
          type: 'error',
          title: 'Invalid Email',
          message: 'Please enter a valid email address.',
        });
        return false;
      }
      if (!password || !passwordRegex.test(password)) {
        showToast({
          type: 'error',
          title: 'Invalid Password',
          message:
            'Password must be at least 8 characters with uppercase, lowercase, number, and special character.',
        });
        return false;
      }
      if (password !== confirmPassword) {
        showToast({
          type: 'error',
          title: 'Password Mismatch',
          message: 'Passwords do not match.',
        });
        return false;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      const profilePicUrl = await uploadImageToCloudinary(profilePic);

      const userData = {
        firstName,
        lastName,
        gender,
        email,
        profilePicUrl: profilePicUrl || null,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'Users', user.uid), userData);

      setUser({uid: user.uid, email: user.email, ...userData});
      await AsyncStorage.setItem(
        'user',
        JSON.stringify({uid: user.uid, email: user.email, ...userData}),
      );
      showToast({
        type: 'success',
        title: 'Account Created',
        message: 'Welcome! Your account has been successfully created.',
      });
      return true;
    } catch (error) {
      let errorMessage = 'Failed to create account.';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email format.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak.';
          break;
        default:
          console.error('Registration error:', error);
      }
      showToast({
        type: 'error',
        title: 'Registration Error',
        message: errorMessage,
      });
      return false;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    setAuthLoading(true);
    try {
      if (auth.currentUser) {
        await signOut(auth);
      }
      setUser(null);
      await AsyncStorage.removeItem('user');
      showToast({
        type: 'success',
        title: 'Logged Out',
        message: 'You have been logged out successfully.',
      });
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      showToast({
        type: 'error',
        title: 'Logout Error',
        message: 'Failed to log out. Please try again.',
      });
      return false;
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{user, loading, authLoading, login, register, logout}}>
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
