import {View, Text} from 'react-native';
import React from 'react';
import Button from '../../components/Button';
import {useAuth} from '../../context/AuthContext';
import {useNavigation} from '@react-navigation/native';

const AllOrders = () => {
  const {logout} = useAuth();
  const navigation = useNavigation();
  const handleLogout = async () => {
    await logout();
    navigation.navigate('login');
  };

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

export default AllOrders;
