import {createStackNavigator} from '@react-navigation/stack';
import BottomTabNavigation from './BottomTabNavigation';
import CheckoutScreen from '../screens/checkout/checkout';
import Homescreen from '../screens/home/Homescreen';
import NotFoundScreen from '../components/not-found';
import ProductScreen from '../screens/product/ProductScreen';
import ProfileScreen from '../screens/profile/profile';
import SearchScreen from '../screens/search/search';
import LoginScreen from '../screens/Login/LoginScreen';
import SignupScreen from '../screens/signup/SignupScreen';
import SplashScreen from '../screens/splash/SplashScreen';
import Orders from '../screens/orders/Orders';
import OrderDetails from '../screens/orders/OrderDetails';

const Stack = createStackNavigator();

const RootNavigation = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="splash" component={SplashScreen} />
      <Stack.Screen name="login" component={LoginScreen} />
      <Stack.Screen name="signup" component={SignupScreen} />
      <Stack.Screen name="BottomTab" component={BottomTabNavigation} />
      <Stack.Screen name="Product" component={ProductScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="Homescreen" component={Homescreen} />
      <Stack.Screen name="NotFound" component={NotFoundScreen} />
      <Stack.Screen name="profile" component={ProfileScreen} />
      <Stack.Screen name="search" component={SearchScreen} />
      <Stack.Screen name="orders" component={Orders} />
      <Stack.Screen name="OrderDetails" component={OrderDetails} />
    </Stack.Navigator>
  );
};

export default RootNavigation;
