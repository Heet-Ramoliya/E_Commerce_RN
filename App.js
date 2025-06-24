import {Platform, StatusBar} from 'react-native';
import React, {useEffect} from 'react';
import {AuthProvider} from './src/context/AuthContext';
import {CartProvider} from './src/context/CartContext';
import {NavigationContainer} from '@react-navigation/native';
import ToastComponent from './src/components/Toast';
import RootNavigation from './src/navigation/RootNavigation';
import Config from 'react-native-config';
import {StripeProvider} from '@stripe/stripe-react-native';
import {requestStoragePermission} from './src/utilities/helper';

const App = () => {
  useEffect(() => {
    const requestPermissions = async () => {
      if (Platform.OS === 'android' && Platform.Version < 30) {
        await requestStoragePermission();
      }
    };

    requestPermissions();
  }, []);

  return (
    <StripeProvider publishableKey={Config.STRIPE_PUBLISHABLE_KEY ?? ''}>
      <AuthProvider>
        <CartProvider>
          <NavigationContainer>
            <RootNavigation />
          </NavigationContainer>
          <ToastComponent />
          <StatusBar style="auto" />
        </CartProvider>
      </AuthProvider>
    </StripeProvider>
  );
};

export default App;
