import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {ScrollView} from 'react-native-gesture-handler';
import SectionHeader from '../../components/SectionHeader';
import ProductCard from '../../components/ProductCard';
import {useNavigation} from '@react-navigation/native';
import Typography from '../../constants/Typography';
import Colors from '../../constants/Colors';
import Spacing from '../../constants/Spacing';
import {useAuth} from '../../context/AuthContext';
import {
  getCategories,
  getFeaturedProducts,
  getNewProducts,
} from '../../data/products';
import CategoryCard from '../../components/CategoryCard';
import {SearchIcon} from 'lucide-react-native';

const {width} = Dimensions.get('window');

const Homescreen = () => {
  const navigation = useNavigation();
  const {user} = useAuth();
  const [loading, setLoading] = useState(true);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 500));

      setFeaturedProducts(getFeaturedProducts());
      setNewProducts(getNewProducts());
      setCategories(getCategories());
      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary[600]} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}>
      {/* Hero Section */}
      <View style={styles.heroContainer}>
        <View style={styles.heroContent}>
          <Text style={styles.welcomeText}>
            Hello, {user ? user.firstName : 'Guest'}
          </Text>
          <Text style={styles.heroTitle}>Find your perfect product</Text>
          <Text style={styles.heroSubtitle}>
            Discover the latest trends and must-have items
          </Text>
        </View>
        <View style={styles.searchContainer}>
          <SearchIcon size={20} color={Colors.neutral[500]} />
          <Text
            style={styles.searchPlaceholder}
            onPress={() =>
              navigation.navigate('BottomTab', {screen: 'Search'})
            }>
            Search products...
          </Text>
        </View>
      </View>

      {/* Categories Section */}
      <View style={styles.categoriesSection}>
        <SectionHeader
          title="Categories"
          actionText="See All"
          onActionPress={() =>
            navigation.navigate('BottomTab', {screen: 'Search'})
          }
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}>
          {categories.map(category => (
            <CategoryCard key={category} category={category} />
          ))}
        </ScrollView>
      </View>

      {/* Featured Products Section */}
      <View style={styles.section}>
        <SectionHeader
          title="Featured Products"
          actionText="See All"
          onActionPress={() =>
            navigation.navigate('BottomTab', {screen: 'Search?featured=true'})
          }
        />
        <FlatList
          data={featuredProducts}
          keyExtractor={item => item.id}
          renderItem={({item}) => <ProductCard product={item} />}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productListContainer}
          ItemSeparatorComponent={() => <View style={{width: Spacing.md}} />}
          snapToInterval={width * 0.65 + Spacing.md}
          decelerationRate="fast"
          style={styles.productList}
        />
      </View>

      {/* New Arrivals Section */}
      <View style={styles.section}>
        <SectionHeader
          title="New Arrivals"
          actionText="See All"
          onActionPress={() =>
            navigation.navigate('BottomTab', {screen: 'Search?featured=true'})
          }
        />
        <View style={styles.productGrid}>
          {newProducts.map(product => (
            <View style={styles.productCardContainer} key={product.id}>
              <ProductCard product={product} />
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    paddingBottom: Spacing.xxl,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xxl,
    backgroundColor: Colors.primary[50],
  },
  heroContent: {
    marginBottom: Spacing.lg,
  },
  welcomeText: {
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.md,
    color: Colors.primary[600],
    marginBottom: Spacing.sm,
  },
  heroTitle: {
    fontFamily: Typography.fonts.semiBold,
    fontSize: Typography.sizes.xxxl,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  heroSubtitle: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.md,
    color: Colors.text.tertiary,
    lineHeight: Typography.lineHeights.normal * Typography.sizes.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Spacing.radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginTop: Spacing.md,
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.md,
    color: Colors.neutral[500],
  },
  categoriesSection: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  categoriesContainer: {
    paddingRight: Spacing.lg,
  },
  section: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  productListContainer: {
    paddingRight: Spacing.lg,
  },
  productList: {
    marginTop: Spacing.md,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.sm / 2,
    marginTop: Spacing.md,
  },
  productCardContainer: {
    width: '50%',
    paddingHorizontal: Spacing.sm / 2,
  },
});

export default Homescreen;
