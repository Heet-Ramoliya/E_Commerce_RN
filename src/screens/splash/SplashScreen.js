import React, {useEffect} from 'react';
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {ShoppingBag} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';
import Colors from '../../constants/Colors';
import Spacing from '../../constants/Spacing';
import Typography from '../../constants/Typography';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {showToast} from '../../components/Toast';

export default function SplashScreen() {
  const navigation = useNavigation();

  const getUser = async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        const parsedUser = JSON.parse(user);
        return parsedUser;
      }
      return null;
    } catch (error) {
      console.error('Error retrieving user from AsyncStorage:', error);
      showToast({
        type: 'error',
        title: 'Storage Error',
        message: 'Failed to load user data. Please log in again.',
      });
      return null;
    }
  };

  useEffect(() => {
    const checkUserAndNavigate = async () => {
      const user = await getUser();
      if (user && user.uid) {
        navigation.replace(user.isAdmin ? 'AdminTab' : 'BottomTab');
      } else {
        navigation.replace('login');
      }
    };

    const timer = setTimeout(() => {
      checkUserAndNavigate();
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <LinearGradient
      colors={[Colors.primary[600], Colors.primary[900]]}
      style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <ShoppingBag size={80} />
        </View>
        <Text style={styles.appName}>ShopEase</Text>
        <ActivityIndicator
          size="large"
          color={Colors.background}
          style={styles.loader}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: Spacing.radius.xl,
    backgroundColor: Colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    elevation: 5,
    shadowColor: Colors.neutral[900],
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  appName: {
    fontFamily: Typography.fonts.bold,
    fontSize: Typography.sizes.xxxl,
    color: Colors.background,
    marginBottom: Spacing.lg,
    letterSpacing: 1.2,
  },
  loader: {
    marginTop: Spacing.md,
  },
});
