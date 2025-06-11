import React, {useState, useEffect, use} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import {ChevronLeft, Heart, Minus, Plus, Share} from 'lucide-react-native';
import {useCart} from '../../context/CartContext';
import {doc, getDoc, onSnapshot} from '@react-native-firebase/firestore';
import {db} from '../../config/firebase';
import Button from '../../components/Button';
import Colors from '../../constants/Colors';
import Spacing from '../../constants/Spacing';
import Typography from '../../constants/Typography';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const {width} = Dimensions.get('window');

export default function ProductScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const {id} = route.params;
  const {addToCart} = useCart();
  const insets = useSafeAreaInsets();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(
      doc(db, 'products', id),
      productDoc => {
        if (productDoc.exists()) {
          const productData = {id: productDoc.id, ...productDoc.data()};
          setProduct(productData);
        } else {
          setProduct(null);
        }
        setLoading(false);
      },
      error => {
        console.error('Error fetching product:', error);
        setProduct(null);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [id]);

  const handleIncrement = () => {
    if (product && quantity < product.stock) {
      setQuantity(prev => prev + 1);
    } else if (product && quantity >= product.stock) {
      Alert.alert('Stock Limit', `Only ${product.stock} items available.`);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = async () => {
    if (product.stock <= 0) {
      Alert.alert('Out of Stock', 'This product is currently unavailable.');
      return;
    }
    if (quantity > product.stock) {
      Alert.alert('Stock Limit', `Only ${product.stock} items available.`);
      return;
    }

    setAdding(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      addToCart(product, quantity);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary[600]} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Product not found</Text>
        <Button
          title="Go Back"
          onPress={() => navigation.goBack()}
          variant="outline"
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header/Image Section */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: product.imageUrls?.[0] || 'https://via.placeholder.com/300',
            }}
            style={styles.image}
            resizeMode="cover"
          />

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <ChevronLeft size={24} color={Colors.text.primary} />
          </TouchableOpacity>

          <View style={styles.imageActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Heart size={20} color={Colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Share size={20} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Product Info Section */}
        <View style={styles.infoContainer}>
          {/* Title and Price */}
          <View style={styles.titleSection}>
            <Text style={styles.category}>{product.category}</Text>
            <Text style={styles.title}>{product.name}</Text>
            <Text style={styles.price}>${product.price.toFixed(2)}</Text>
          </View>

          {/* Quantity Selection */}
          <View style={styles.selectorSection}>
            <Text style={styles.selectorTitle}>Quantity</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={handleDecrement}
                disabled={quantity <= 1}>
                <Minus
                  size={16}
                  color={
                    quantity <= 1 ? Colors.neutral[400] : Colors.text.primary
                  }
                />
              </TouchableOpacity>

              <Text style={styles.quantity}>{quantity}</Text>

              <TouchableOpacity
                style={styles.quantityButton}
                onPress={handleIncrement}
                disabled={product.stock <= 0}>
                <Plus
                  size={16}
                  color={
                    product.stock <= 0
                      ? Colors.neutral[400]
                      : Colors.text.primary
                  }
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.descriptionSection}>
            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomContainer}>
        <Button
          title="Add to Cart"
          onPress={handleAddToCart}
          loading={adding}
          fullWidth
          disabled={product.stock <= 0}
          textStyle={{paddingVertical: Spacing.sm}}
        />
      </View>
    </View>
  );
}

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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorText: {
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.lg,
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
  },
  imageContainer: {
    height: width * 0.9,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: Spacing.lg,
    left: Spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.neutral[900],
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  imageActions: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    shadowColor: Colors.neutral[900],
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  infoContainer: {
    padding: Spacing.lg,
    backgroundColor: Colors.background,
    borderTopLeftRadius: Spacing.radius.xl,
    borderTopRightRadius: Spacing.radius.xl,
    marginTop: -Spacing.xl,
  },
  titleSection: {
    marginBottom: Spacing.lg,
  },
  category: {
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.sm,
    color: Colors.text.tertiary,
    marginBottom: Spacing.xs,
  },
  title: {
    fontFamily: Typography.fonts.semiBold,
    fontSize: Typography.sizes.xxl,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  price: {
    fontFamily: Typography.fonts.semiBold,
    fontSize: Typography.sizes.xl,
    color: Colors.primary[600],
    marginBottom: Spacing.xs,
  },
  stock: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
  },
  selectorSection: {
    marginBottom: Spacing.lg,
  },
  selectorTitle: {
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.md,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: Spacing.radius.md,
    alignSelf: 'flex-start',
  },
  quantityButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantity: {
    paddingHorizontal: Spacing.md,
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.md,
    color: Colors.text.primary,
    minWidth: 40,
    textAlign: 'center',
  },
  descriptionSection: {
    marginBottom: Spacing.xl,
  },
  descriptionTitle: {
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.md,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  description: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.md,
    color: Colors.text.secondary,
    lineHeight: Typography.lineHeights.normal * Typography.sizes.md,
  },
  bottomContainer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
    backgroundColor: Colors.background,
  },
});
