import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {
  User as UserIcon,
  Package,
  CreditCard,
  Bell,
  LogOut,
  Lock,
  ChevronRight,
} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';
import Colors from '../../constants/Colors';
import Spacing from '../../constants/Spacing';
import Typography from '../../constants/Typography';
import {useAuth} from '../../context/AuthContext';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const {user, logout, loading: authLoading} = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigation.navigate('login');
    }
  }, [authLoading, user, navigation]);

  if (authLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary[600]} />
      </View>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}>
      <View style={styles.profileHeader}>
        <View style={styles.profileImageContainer}>
          {user.profilePicUrl ? (
            <Image
              source={{uri: user.profilePicUrl}}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <UserIcon size={40} color={Colors.neutral[400]} />
            </View>
          )}
        </View>
        <Text style={styles.profileName}>{user.firstName}</Text>
        <Text style={styles.profileEmail}>{user.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Settings</Text>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIconContainer}>
            <UserIcon size={20} color={Colors.primary[600]} />
          </View>
          <Text style={styles.menuItemText}>Personal Information</Text>
          <ChevronRight size={18} color={Colors.neutral[400]} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIconContainer}>
            <Package size={20} color={Colors.primary[600]} />
          </View>
          <Text style={styles.menuItemText}>Orders & Returns</Text>
          <ChevronRight size={18} color={Colors.neutral[400]} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIconContainer}>
            <CreditCard size={20} color={Colors.primary[600]} />
          </View>
          <Text style={styles.menuItemText}>Payment Methods</Text>
          <ChevronRight size={18} color={Colors.neutral[400]} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIconContainer}>
            <Lock size={20} color={Colors.primary[600]} />
          </View>
          <Text style={styles.menuItemText}>Security & Privacy</Text>
          <ChevronRight size={18} color={Colors.neutral[400]} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIconContainer}>
            <Bell size={20} color={Colors.primary[600]} />
          </View>
          <Text style={styles.menuItemText}>Notifications</Text>
          <ChevronRight size={18} color={Colors.neutral[400]} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <LogOut size={18} color={Colors.error[600]} style={styles.logoutIcon} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.sm,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeader: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontFamily: Typography.fonts.semiBold,
    fontSize: Typography.sizes.xl,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  profileEmail: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.md,
    color: Colors.text.tertiary,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  sectionTitle: {
    fontFamily: Typography.fonts.semiBold,
    fontSize: Typography.sizes.lg,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  menuItemText: {
    flex: 1,
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.md,
    color: Colors.text.primary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xl,
    marginHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.error[100],
    borderRadius: Spacing.radius.md,
    backgroundColor: Colors.error[50],
  },
  logoutIcon: {
    marginRight: Spacing.sm,
  },
  logoutText: {
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.md,
    color: Colors.error[600],
  },
});
