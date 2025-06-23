import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import Colors from '../constants/Colors';
import Spacing from '../constants/Spacing';
import Typography from '../constants/Typography';
import {useCart} from '../context/CartContext';
import {useNavigation} from '@react-navigation/native';

const {width} = Dimensions.get('window');
const numColumns = 2;
const cardMargin = Spacing.md;
const cardWidth =
  (width - Spacing.lg * 2 - cardMargin * (numColumns - 1)) / numColumns;

const FALLBACK_IMAGE = 'https://via.placeholder.com/150';

const ProductCard = ({product}) => {
  const navigation = useNavigation();
  const {addToCart, cart, updateQuantity} = useCart();

  const handlePress = () => {
    navigation.navigate('Product', {id: product.id});
  };

  const handleAddToCart = () => {
    addToCart(product);
  };

  const handleDecreaseQuantity = () => {
    const cartItem = cart.find(item => item.id === product.id);
    if (cartItem) {
      updateQuantity(product.id, cartItem.quantity - 1);
    }
  };

  const imageUri = Array.isArray(product.imageUrls)
    ? product.imageUrls[0]
    : product.imageUrls || FALLBACK_IMAGE;

  const cartItem = cart.find(item => item.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  return (
    <TouchableOpacity
      style={[styles.card, {width: cardWidth}]}
      onPress={handlePress}
      activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        <Image
          source={{uri: imageUri}}
          style={styles.image}
          defaultSource={{uri: FALLBACK_IMAGE}}
          resizeMode="contain"
        />
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.category}>{product.category || 'Unknown'}</Text>
        <Text style={styles.name} numberOfLines={2}>
          {product.name || 'Unnamed Product'}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>
            ${product.price ? product.price.toFixed(2) : '0.00'}
          </Text>
          <View style={styles.quantityControls}>
            {quantity > 0 && (
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={handleDecreaseQuantity}>
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
            )}
            {quantity > 0 && (
              <Text style={styles.quantityText}>{quantity}</Text>
            )}
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={handleAddToCart}>
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background,
    borderRadius: Spacing.radius.md,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    ...Platform.select({
      default: {
        elevation: 3,
        shadowColor: Colors.neutral[900],
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
    }),
  },
  imageContainer: {
    height: 180,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  contentContainer: {
    padding: Spacing.md,
  },
  category: {
    color: Colors.text.tertiary,
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.regular,
    marginBottom: Spacing.xs,
  },
  name: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.semiBold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    height: 44,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fonts.semiBold,
    color: Colors.primary[600],
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: Colors.primary[50],
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: Spacing.radius.sm,
    marginHorizontal: Spacing.xs,
  },
  quantityButtonText: {
    color: Colors.primary[600],
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.medium,
  },
  quantityText: {
    color: Colors.text.primary,
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.medium,
    marginHorizontal: Spacing.xs,
  },
});

export default ProductCard;
