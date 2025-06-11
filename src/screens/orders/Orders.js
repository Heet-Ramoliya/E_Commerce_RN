import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import React, {use, useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '../../context/AuthContext';
import {
  collection,
  onSnapshot,
  query,
  where,
} from '@react-native-firebase/firestore';
import {db} from '../../config/firebase';
import {ChevronRight, ShoppingCart} from 'lucide-react-native';
import Typography from '../../constants/Typography';
import Spacing from '../../constants/Spacing';
import Colors from '../../constants/Colors';
import Header from '../../components/Header';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const Orders = () => {
  const navigation = useNavigation();
  const {user} = useAuth();
  const [loading, setLoading] = useState(true);
  const [ordersData, setOrders] = useState([]);

  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!user) {
      Alert.alert('Error', 'Please sign in to view orders.');
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'orders'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const ordersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().createdAt
            ? new Date(doc.data().createdAt.seconds * 1000)
                .toISOString()
                .split('T')[0]
            : null,
        }));
        setOrders(ordersData);
        setLoading(false);
      },
      error => {
        console.error('Error fetching orders:', error);
        Alert.alert('Error', 'Failed to fetch orders. Please try again.');
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user]);

  const renderOrderItem = ({item}) => (
    <TouchableOpacity
      key={item.id}
      activeOpacity={0.8}
      style={styles.orderCard}
      onPress={() => navigation.navigate('OrderDetails', {orderId: item.id})}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #{item.id.slice(0, 8)}</Text>
        <Text style={styles.orderDate}>{item.date}</Text>
      </View>
      <View style={styles.orderDetails}>
        <Text style={styles.customerName}>
          {item.customer.firstName} {item.customer.lastName}
        </Text>
        <Text
          style={[
            styles.orderStatus,
            {
              color:
                item.status === 'Processing'
                  ? Colors.primary[600]
                  : item.status === 'Delivered'
                  ? Colors.success[600]
                  : item.status === 'Cancelled'
                  ? Colors.error[600]
                  : item.status === 'Shipped'
                  ? Colors.accent[400]
                  : Colors.neutral[600],
            },
          ]}>
          Status: {item.status}
        </Text>
        <Text style={styles.orderTotal}>Total: ${item.total.toFixed(2)}</Text>
        <Text style={styles.paymentMethod}>Paid via: {item.paymentMethod}</Text>
        <Text style={styles.shippingAddress}>
          Shipping: {item.shippingAddress.street}, {item.shippingAddress.city},{' '}
          {item.shippingAddress.state}, {item.shippingAddress.zip}
        </Text>
        <View style={styles.itemsContainer}>
          <Text style={styles.itemsTitle}>Items:</Text>
          {item.items.map((product, index) => (
            <View key={index} style={styles.itemRow}>
              <Image
                source={{
                  uri: product.image || 'https://via.placeholder.com/50',
                }}
                style={styles.itemImage}
                resizeMode="contain"
              />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{product.name}</Text>
                <Text style={styles.itemPrice}>
                  ${product.price.toFixed(2)} x {product.quantity}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.orderFooter}>
        <ChevronRight size={Typography.sizes.lg} color={Colors.primary[600]} />
        <Text style={styles.viewDetails}>View Details</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <ShoppingCart size={80} color={Colors.neutral[400]} />
      <Text style={styles.emptyText}>No orders found</Text>
      <Text style={styles.emptySubText}>
        Start shopping to see your orders here!
      </Text>
      <TouchableOpacity
        style={styles.shopButton}
        onPress={() => navigation.navigate('Home')}>
        <Text style={styles.shopButtonText}>Shop Now</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <Header title="My Orders" />
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary[600]} />
        </View>
      ) : ordersData.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={ordersData}
          renderItem={renderOrderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default Orders;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  orderCard: {
    backgroundColor: Colors.background,
    borderRadius: Spacing.radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: Colors.neutral[900],
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  orderId: {
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.md,
    color: Colors.text.primary,
    letterSpacing: Typography.letterSpacing.normal,
  },
  orderDate: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.sm,
    color: Colors.text.tertiary,
  },
  orderDetails: {
    marginBottom: Spacing.sm,
  },
  customerName: {
    fontFamily: Typography.fonts.semiBold,
    fontSize: Typography.sizes.md,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    letterSpacing: Typography.letterSpacing.normal,
  },
  orderStatus: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.sm,
    marginBottom: Spacing.xs,
  },
  orderTotal: {
    fontFamily: Typography.fonts.semiBold,
    fontSize: Typography.sizes.md,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    letterSpacing: Typography.letterSpacing.normal,
  },
  paymentMethod: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  shippingAddress: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  itemsContainer: {
    marginTop: Spacing.sm,
  },
  itemsTitle: {
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.sm,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    letterSpacing: Typography.letterSpacing.normal,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: Spacing.radius.sm,
    marginRight: Spacing.sm,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.sm,
    color: Colors.text.primary,
    letterSpacing: Typography.letterSpacing.normal,
  },
  itemPrice: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
  },
  orderFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  viewDetails: {
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.sm,
    color: Colors.primary[600],
    marginLeft: Spacing.xs,
    letterSpacing: Typography.letterSpacing.normal,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  emptyText: {
    fontFamily: Typography.fonts.semiBold,
    fontSize: Typography.sizes.xl,
    color: Colors.text.primary,
    marginTop: Spacing.md,
    letterSpacing: Typography.letterSpacing.tight,
  },
  emptySubText: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  shopButton: {
    backgroundColor: Colors.primary[600],
    paddingVertical: Spacing.padding.sm,
    paddingHorizontal: Spacing.padding.lg,
    borderRadius: Spacing.radius.sm,
  },
  shopButtonText: {
    fontFamily: Typography.fonts.semiBold,
    fontSize: Typography.sizes.md,
    color: Colors.text.inverse,
    letterSpacing: Typography.letterSpacing.normal,
  },
});
