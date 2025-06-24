import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from '@react-native-firebase/firestore';
import {db} from '../../config/firebase';
import Typography from '../../constants/Typography';
import Colors from '../../constants/Colors';
import Spacing from '../../constants/Spacing';
import Header from '../../components/Header';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {handleDownloadReceipt} from '../../utilities/helper';

const OrderDetails = ({route}) => {
  const {orderId} = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState(null);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  console.log('company data :: ', company);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'orders', orderId),
      orderDoc => {
        if (orderDoc.exists()) {
          const data = orderDoc.data();
          setOrder({
            id: orderDoc.id,
            ...data,
            date: data.createdAt
              ? new Date(data.createdAt.seconds * 1000)
                  .toISOString()
                  .split('T')[0]
              : null,
          });
        } else {
          Alert.alert('Error', 'Order not found.');
        }
        setLoading(false);
      },
      error => {
        console.error('Error fetching order:', error);
        Alert.alert('Error', 'Failed to load order details.');
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [orderId]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'company'),
      snapshot => {
        const companyData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCompany(companyData);
        setLoading(false);
      },
      error => {
        console.log('Error fetching company details:', error);
        setLoading(false);
      },
    );
    return () => unsubscribe();
  }, []);

  const downloadReceipts = async () => {
    await handleDownloadReceipt(order, company[0]);
  };

  const handleCancelOrder = async () => {
    Alert.alert(
      'Confirm Cancellation',
      'Are you sure you want to cancel this order?',
      [
        {text: 'No', style: 'cancel'},
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              const orderRef = doc(db, 'orders', orderId);
              await updateDoc(orderRef, {status: 'Cancelled'});
              setOrder(prev => ({...prev, status: 'Cancelled'}));
              Alert.alert('Success', 'Order has been cancelled.', [
                {
                  text: 'OK',
                  onPress: () => navigation.navigate('BottomTab'),
                },
              ]);
            } catch (error) {
              console.error('Error cancelling order:', error);
              Alert.alert('Error', 'Failed to cancel order. Please try again.');
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Order Details" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary[600]} />
        </View>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <Header title="Order Details" />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Order not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <Header title="Order Details" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Information</Text>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Order ID:</Text>
            <Text style={styles.value}>#{order.id.slice(0, 8)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>{order.date}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Status:</Text>
            <Text
              style={[
                styles.value,
                {
                  color:
                    order.status === 'Processing'
                      ? Colors.warning[600]
                      : order.status === 'Delivered'
                      ? Colors.success[600]
                      : order.status === 'Cancelled'
                      ? Colors.error[600]
                      : Colors.neutral[600],
                },
              ]}>
              {order.status}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>
              {order.customer.firstName} {order.customer.lastName}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{order.customer.email}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          <Text style={styles.value}>
            {order.shippingAddress.name}
            {'\n'}
            {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
            {order.shippingAddress.state}, {order.shippingAddress.zip}
            {'\n'}
            {order.shippingAddress.country}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>
          {order.items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <Image
                source={{uri: item.image}}
                style={styles.itemImage}
                resizeMode="contain"
              />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>
                  ${item.price.toFixed(2)} x {item.quantity}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Payment Method:</Text>
            <Text style={styles.value}>{order.paymentMethod}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Subtotal:</Text>
            <Text style={styles.value}>${order.subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Tax:</Text>
            <Text style={styles.value}>${order.tax.toFixed(2)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Total:</Text>
            <Text style={styles.totalValue}>${order.total.toFixed(2)}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.cancelButton, {backgroundColor: Colors.primary[600]}]}
          onPress={downloadReceipts}>
          <Text style={styles.cancelButtonText}>Download Receipt</Text>
        </TouchableOpacity>

        {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelOrder}>
            <Text style={styles.cancelButtonText}>Cancel Order</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: Typography.fonts.semiBold,
    fontSize: Typography.sizes.xl,
    color: Colors.text.primary,
    letterSpacing: Typography.letterSpacing.tight,
  },
  scrollContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  section: {
    backgroundColor: Colors.background,
    borderRadius: Spacing.radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    shadowColor: Colors.neutral[900],
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontFamily: Typography.fonts.semiBold,
    fontSize: Typography.sizes.lg,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    letterSpacing: Typography.letterSpacing.normal,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  label: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
  },
  value: {
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.sm,
    color: Colors.text.primary,
    textAlign: 'left',
  },
  totalValue: {
    fontFamily: Typography.fonts.semiBold,
    fontSize: Typography.sizes.md,
    color: Colors.text.primary,
    textAlign: 'right',
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
  cancelButton: {
    backgroundColor: Colors.error[600],
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Spacing.radius.sm,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  cancelButtonText: {
    fontFamily: Typography.fonts.semiBold,
    fontSize: Typography.sizes.sm,
    color: Colors.text.inverse,
    textAlign: 'center',
    letterSpacing: Typography.letterSpacing.normal,
  },
});

export default OrderDetails;
