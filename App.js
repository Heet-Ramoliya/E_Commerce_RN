import {StatusBar} from 'react-native';
import React from 'react';
import {StripeProvider} from '@stripe/stripe-react-native';
import {AuthProvider} from './src/context/AuthContext';
import {CartProvider} from './src/context/CartContext';
import RootNavigation from './src/navigation/RootNavigation';
import Config from 'react-native-config';
import {NavigationContainer} from '@react-navigation/native';

const App = () => {
  return (
    <StripeProvider publishableKey={Config.STRIPE_PUBLISHABLE_KEY ?? ''}>
      <AuthProvider>
        <CartProvider>
          <NavigationContainer>
            <RootNavigation />
          </NavigationContainer>
          <StatusBar style="auto" />
        </CartProvider>
      </AuthProvider>
    </StripeProvider>
  );
};

export default App;
