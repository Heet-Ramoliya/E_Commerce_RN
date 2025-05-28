import {createStackNavigator} from '@react-navigation/stack';
import BottomTabNavigation from './BottomTabNavigation';
import CheckoutScreen from '../screens/checkout/checkout';
import Homescreen from '../screens/home/Homescreen';
import NotFoundScreen from '../components/not-found';
import ProductScreen from '../screens/product/[id]';
import ProfileScreen from '../screens/profile/profile';
import SearchScreen from '../screens/search/search';
import AdminPanel from '../screens/admin/AdminPanel';
import {useAuth} from '../context/AuthContext';

const Stack = createStackNavigator();

const RootNavigation = () => {
  const {user, isAdmin} = useAuth();

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="BottomTab" component={BottomTabNavigation} />
      <Stack.Screen name="Product" component={ProductScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="Homescreen" component={Homescreen} />
      <Stack.Screen name="NotFound" component={NotFoundScreen} />
      <Stack.Screen name="profile" component={ProfileScreen} />
      <Stack.Screen name="search" component={SearchScreen} />
      
      {/* Admin Routes */}
      {isAdmin() && (
        <>
          <Stack.Screen name="AdminPanel" component={AdminPanel} />
          {/* Add other admin screens here */}
        </>
      )}
    </Stack.Navigator>
  );
};

export default RootNavigation;