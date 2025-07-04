import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {ChevronLeft, MapPin, X} from 'lucide-react-native';
import Config from 'react-native-config';
import {useNavigation} from '@react-navigation/native';
import InputField from '../../components/InputField';
import Button from '../../components/Button';
import Colors from '../../constants/Colors';
import Spacing from '../../constants/Spacing';
import Typography from '../../constants/Typography';
import {useCart} from '../../context/CartContext';
import {useStripe} from '@stripe/stripe-react-native';
import {useAuth} from '../../context/AuthContext';
import {db} from '../../config/firebase';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Header from '../../components/Header';

export default function CheckoutScreen() {
  const navigation = useNavigation();
  const {cart, getCartTotal, clearCart} = useCart();
  const {user} = useAuth();
  const {initPaymentSheet, presentPaymentSheet} = useStripe();

  const [activeStep, setActiveStep] = useState('shipping');
  const [processing, setProcessing] = useState(false);
  const [isExpressShipping, setIsExpressShipping] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const [paymentId, setPaymentId] = useState(null);

  const [shippingForm, setShippingForm] = useState({
    name: user
      ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || ''
      : '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
  });

  const insets = useSafeAreaInsets();

  const subtotal = getCartTotal();
  const standardShipping = subtotal > 100 ? 0 : 10;
  const expressShippingCost = 80;
  const shipping = isExpressShipping ? expressShippingCost : standardShipping;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleShippingChange = (field, value) => {
    setShippingForm(prev => ({...prev, [field]: value}));
  };

  const validateShippingForm = () => {
    const {name, street, city, state, zip} = shippingForm;
    return name && street && city && state && zip;
  };

  const handleContinueToPayment = () => {
    if (validateShippingForm()) {
      setActiveStep('payment');
    } else {
      Alert.alert(
        'Missing Information',
        'Please fill in all shipping details.',
      );
    }
  };

  const handlePlaceOrder = async () => {
    setProcessing(true);
    try {
      if (!user?.uid) {
        throw new Error('User is not authenticated');
      }
      if (!cart?.length) {
        throw new Error('Cart is empty');
      }
      if (!paymentIntentId) {
        throw new Error('Payment Intent ID is missing');
      }
      const {name, street, city, state, zip, country} = shippingForm;
      if (!name || !street || !city || !state || !zip || !country) {
        throw new Error('Incomplete shipping information');
      }

      const newOrder = {
        userId: user.uid,
        status: 'Processing',
        customer: {
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
        },
        items: cart.map(item => ({
          productId: item.id ?? '',
          name: item.name ?? '',
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1,
          image: item.imageUrls?.[0] ?? '',
        })),
        subtotal: Number(subtotal) || 0,
        tax: Number(tax) || 0,
        total: Number(total) || 0,
        shippingAddress: {
          name: name ?? '',
          street: street ?? '',
          city: city ?? '',
          state: state ?? '',
          zip: zip ?? '',
          country: country ?? 'India',
        },
        shippingMethod: isExpressShipping ? 'Express' : 'Standard',
        paymentMethod: 'Card',
        paymentIntentId: paymentId ?? '',
        createdAt: new Date(),
      };

      console.log('New Order:', JSON.stringify(newOrder, null, 2));

      const orderRef = await db.collection('orders').add(newOrder);

      clearCart();

      navigation.replace('BottomTab', {screen: 'Home'});

      Alert.alert(
        'Order Placed Successfully',
        `Your order #${orderRef.id} has been placed and is being processed.`,
        [{text: 'OK'}],
      );
    } catch (error) {
      console.error('Error saving order to Firestore:', error);
      Alert.alert('Error', `Failed to place the order: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const fetchPaymentSheetParams = async () => {
    try {
      const response = await fetch(`${Config.BACKEND_URL}/payment-sheet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(total * 100),
          currency: 'usd',
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || 'Failed to fetch payment sheet params',
        );
      }
      const {paymentIntent, ephemeralKey, customer, paymentIntentId} =
        await response.json();
      return {paymentIntent, ephemeralKey, customer, paymentIntentId};
    } catch (error) {
      console.error('Error fetching payment sheet params:', error);
      throw error;
    }
  };

  const initializePaymentSheet = async () => {
    try {
      const {paymentIntent, paymentIntentId, ephemeralKey, customer} =
        await fetchPaymentSheetParams();
      setPaymentIntentId(paymentIntent);
      setPaymentId(paymentIntentId);
      const {error} = await initPaymentSheet({
        merchantDisplayName: 'E-Commerce',
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        allowsDelayedPaymentMethods: true,
        defaultBillingDetails: {
          name: shippingForm.name || 'Jane Doe',
        },
      });
      if (error) {
        console.error('Error initializing payment sheet:', error);
        Alert.alert('Error', 'Failed to initialize payment. Please try again.');
      }
    } catch (error) {
      console.error('Error in initializePaymentSheet:', error);
    }
  };

  const openPaymentSheet = async () => {
    setProcessing(true);
    try {
      const {paymentIntent, paymentIntentId} = await fetchPaymentSheetParams();
      if (!paymentIntent) {
        throw new Error('Failed to fetch payment intent');
      }
      setPaymentIntentId(paymentIntent);
      setPaymentId(paymentIntentId);
      const {error} = await presentPaymentSheet();
      if (error) {
        Alert.alert(`Error code: ${error.code}`, error.message);
      } else {
        await handlePlaceOrder();
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      Alert.alert('Error', 'Failed to process payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    initializePaymentSheet();
  }, [isExpressShipping]);

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <Header title="Checkout" />
      <View style={styles.progressContainer}>
        <View
          style={[
            styles.progressStep,
            activeStep === 'shipping' && styles.activeProgressStep,
          ]}>
          <MapPin
            size={20}
            color={
              activeStep === 'shipping'
                ? Colors.text.inverse
                : Colors.text.tertiary
            }
          />
          <Text
            style={[
              styles.progressStepText,
              activeStep === 'shipping' && styles.activeProgressStepText,
            ]}>
            Shipping
          </Text>
        </View>

        <View style={styles.progressLine} />

        <View
          style={[
            styles.progressStep,
            activeStep === 'payment' && styles.activeProgressStep,
          ]}>
          <MapPin
            size={20}
            color={
              activeStep === 'payment'
                ? Colors.text.inverse
                : Colors.text.tertiary
            }
          />
          <Text
            style={[
              styles.progressStepText,
              activeStep === 'payment' && styles.activeProgressStepText,
            ]}>
            Payment
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {activeStep === 'shipping' && (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Shipping Information</Text>

            <InputField
              label="Full Name"
              placeholder="Enter your full name"
              value={shippingForm.name}
              onChangeText={value => handleShippingChange('name', value)}
              required
            />

            <InputField
              label="Street Address"
              placeholder="Enter your street address"
              value={shippingForm.street}
              onChangeText={value => handleShippingChange('street', value)}
              required
            />

            <InputField
              label="City"
              placeholder="Enter your city"
              value={shippingForm.city}
              onChangeText={value => handleShippingChange('city', value)}
              required
            />

            <View style={styles.rowFields}>
              <InputField
                label="State"
                placeholder="State"
                value={shippingForm.state}
                onChangeText={value => handleShippingChange('state', value)}
                required
                style={styles.halfField}
              />

              <InputField
                label="ZIP Code"
                placeholder="ZIP"
                value={shippingForm.zip}
                onChangeText={value => handleShippingChange('zip', value)}
                keyboardType="numeric"
                required
                style={styles.halfField}
              />
            </View>

            <InputField
              label="Country"
              placeholder="Country"
              value={shippingForm.country}
              onChangeText={value => handleShippingChange('country', value)}
              required
            />

            <View style={styles.shippingOptions}>
              <Text style={styles.shippingOptionsTitle}>Shipping Method</Text>

              <TouchableOpacity
                style={[
                  styles.shippingOption,
                  !isExpressShipping && styles.selectedShippingOption,
                ]}
                onPress={() => setIsExpressShipping(false)}>
                <View style={styles.shippingOptionRadio}>
                  {!isExpressShipping && (
                    <View style={styles.shippingOptionRadioInner} />
                  )}
                </View>
                <View style={styles.shippingOptionContent}>
                  <View style={styles.shippingOptionHeader}>
                    <Text style={styles.shippingOptionName}>
                      Standard Shipping
                    </Text>
                    <Text style={styles.shippingOptionPrice}>
                      {standardShipping === 0
                        ? 'Free'
                        : `$${standardShipping.toFixed(2)}`}
                    </Text>
                  </View>
                  <Text style={styles.shippingOptionDescription}>
                    Estimated delivery in 5-7 business days
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.shippingOption,
                  styles.expressShippingOption,
                  isExpressShipping && styles.selectedShippingOption,
                ]}
                onPress={() => setIsExpressShipping(true)}>
                <View style={styles.shippingOptionRadio}>
                  {isExpressShipping && (
                    <View style={styles.shippingOptionRadioInner} />
                  )}
                </View>
                <View style={styles.shippingOptionContent}>
                  <View style={styles.shippingOptionHeader}>
                    <Text style={styles.shippingOptionName}>
                      Express Shipping
                    </Text>
                    <Text style={styles.shippingOptionPrice}>
                      ${expressShippingCost.toFixed(2)}
                    </Text>
                  </View>
                  <Text style={styles.shippingOptionDescription}>
                    Guaranteed delivery in 1-2 business days
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeStep === 'payment' && (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Payment Information</Text>
            <Text style={styles.paymentText}>
              You will be prompted to enter your payment details when you place
              the order.
            </Text>
          </View>
        )}

        <View style={styles.orderSummary}>
          <Text style={styles.summaryTitle}>Order Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.summaryValue}>
              {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax</Text>
            <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
          </View>

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        {activeStep === 'shipping' ? (
          <Button
            title="Continue to Payment"
            onPress={handleContinueToPayment}
            fullWidth
            textStyle={{paddingVertical: Spacing.sm}}
          />
        ) : (
          <Button
            title="Place Order"
            onPress={openPaymentSheet}
            loading={processing}
            fullWidth
            disabled={processing}
            textStyle={{paddingVertical: Spacing.sm}}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: Spacing.radius.full,
    backgroundColor: Colors.neutral[100],
  },
  activeProgressStep: {
    backgroundColor: Colors.primary[600],
  },
  progressStepText: {
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.sm,
    color: Colors.text.tertiary,
    marginLeft: Spacing.xs,
  },
  activeProgressStepText: {
    color: Colors.text.inverse,
  },
  progressLine: {
    height: 1,
    width: 40,
    backgroundColor: Colors.neutral[300],
    marginHorizontal: Spacing.md,
  },
  content: {
    flex: 1,
  },
  formContainer: {
    padding: Spacing.lg,
  },
  formTitle: {
    fontFamily: Typography.fonts.semiBold,
    fontSize: Typography.sizes.lg,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  rowFields: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfField: {
    width: '48%',
  },
  shippingOptions: {
    marginTop: Spacing.md,
  },
  shippingOptionsTitle: {
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.md,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  shippingOption: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: Spacing.radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  selectedShippingOption: {
    borderColor: Colors.primary[600],
    backgroundColor: Colors.primary[50],
  },
  expressShippingOption: {
    borderStyle: 'dashed',
  },
  shippingOptionRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.neutral[400],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  shippingOptionRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary[600],
  },
  shippingOptionContent: {
    flex: 1,
  },
  shippingOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  shippingOptionName: {
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.md,
    color: Colors.text.primary,
  },
  shippingOptionPrice: {
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.md,
    color: Colors.primary[600],
  },
  shippingOptionDescription: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.sm,
    color: Colors.text.tertiary,
  },
  paymentText: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.md,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  orderSummary: {
    padding: Spacing.lg,
    backgroundColor: Colors.ne5,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[300],
  },
  summaryTitle: {
    fontFamily: Typography.fonts.semiBold,
    fontSize: Typography.sizes.lg,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  summaryLabel: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.md,
    color: Colors.text.tertiary,
  },
  summaryValue: {
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.md,
    color: Colors.text.primary,
  },
  totalRow: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
  totalLabel: {
    fontFamily: Typography.fonts.semiBold,
    fontSize: Typography.sizes.lg,
    color: Colors.text.primary,
  },
  totalValue: {
    fontFamily: Typography.fonts.semiBold,
    fontSize: Typography.sizes.lg,
    color: Colors.primary[600],
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
    backgroundColor: Colors.background,
  },
});
