import {StatusBar} from 'react-native';
import React from 'react';
import {AuthProvider} from './src/context/AuthContext';
import {CartProvider} from './src/context/CartContext';
import {NavigationContainer} from '@react-navigation/native';
import ToastComponent from './src/components/Toast';
import RootNavigation from './src/navigation/RootNavigation';
import Config from 'react-native-config';
import {StripeProvider} from '@stripe/stripe-react-native';

const App = () => {
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
