import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import {Package, Grid, ShoppingBag} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';
import Colors from '../../constants/Colors';
import Typography from '../../constants/Typography';
import Spacing from '../../constants/Spacing';

const AdminPanel = () => {
  const navigation = useNavigation();

  const menuItems = [
    {
      title: 'Products',
      icon: Package,
      screen: 'AdminProducts',
      description: 'Manage products and inventory',
    },
    {
      title: 'Categories',
      icon: Grid,
      screen: 'AdminCategories',
      description: 'Manage product categories',
    },
    {
      title: 'Orders',
      icon: ShoppingBag,
      screen: 'AdminOrders',
      description: 'View and manage customer orders',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Panel</Text>
        <Text style={styles.subtitle}>Manage your store</Text>
      </View>

      <View style={styles.menuGrid}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => navigation.navigate(item.screen)}>
            <View style={styles.iconContainer}>
              <item.icon size={24} color={Colors.primary[600]} />
            </View>
            <Text style={styles.menuItemTitle}>{item.title}</Text>
            <Text style={styles.menuItemDescription}>{item.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: Spacing.lg,
    paddingTop: Spacing.xxl,
  },
  title: {
    fontFamily: Typography.fonts.semiBold,
    fontSize: Typography.sizes.xxl,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.md,
    color: Colors.text.tertiary,
  },
  menuGrid: {
    padding: Spacing.lg,
  },
  menuItem: {
    backgroundColor: Colors.background,
    borderRadius: Spacing.radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  menuItemTitle: {
    fontFamily: Typography.fonts.semiBold,
    fontSize: Typography.sizes.lg,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  menuItemDescription: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.md,
    color: Colors.text.tertiary,
  },
});

export default AdminPanel;