import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Homescreen from '../screens/home/Homescreen';
import Colors from '../constants/Colors';
import {Home, ListOrdered} from 'lucide-react-native';
import AddProduct from '../screens/admin/AddProduct';
import AddCategory from '../screens/admin/AddCategory';
import AllOrders from '../screens/admin/AllOrders';

const Tab = createBottomTabNavigator();

const AdminBottomTabNavigation = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary[600],
        tabBarInactiveTintColor: Colors.neutral[400],
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: Colors.neutral[200],
          backgroundColor: Colors.background,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
      }}>
      <Tab.Screen
        name="AddProduct"
        component={AddProduct}
        options={{
          tabBarIcon: ({color, size}) => <Home color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="AddCategory"
        component={AddCategory}
        options={{
          tabBarIcon: ({color, size}) => <Home color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="AllOrders"
        component={AllOrders}
        options={{
          tabBarIcon: ({color, size}) => (
            <ListOrdered color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default AdminBottomTabNavigation;
