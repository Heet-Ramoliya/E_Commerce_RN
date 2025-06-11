import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Colors from '../constants/Colors';
import Spacing from '../constants/Spacing';
import Typography from '../constants/Typography';
import {useCart} from '../context/CartContext';
import {useNavigation} from '@react-navigation/native';

const FALLBACK_IMAGE = 'https://via.placeholder.com/150';

const ProductCard = ({product}) => {
  const navigation = useNavigation();
  const {addToCart} = useCart();

  const handlePress = () => {
    navigation.navigate('Product', {id: product.id});
  };

  const handleAddToCart = () => {
    addToCart(product);
  };

  const imageUri = Array.isArray(product.imageUrls)
    ? product.imageUrls[0]
    : product.imageUrls || FALLBACK_IMAGE;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        <Image
          source={{uri: imageUri}}
          style={styles.image}
          defaultSource={{uri: FALLBACK_IMAGE}}
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
          <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
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
      web: {
        width: '100%',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        ':hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
        },
      },
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
    width: '230',
    height: '100%',
    resizeMode: 'contain',
  },
  newBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.accent[500],
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.radius.sm,
  },
  newBadgeText: {
    color: Colors.text.inverse,
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.medium,
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
  addButton: {
    backgroundColor: Colors.primary[50],
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: Spacing.radius.sm,
  },
  addButtonText: {
    color: Colors.primary[600],
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.medium,
  },
});

export default ProductCard;
