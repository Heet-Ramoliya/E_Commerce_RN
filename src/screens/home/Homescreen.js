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
import CategoryCard from '../../components/CategoryCard';
import {SearchIcon} from 'lucide-react-native';
import {db} from '../../config/firebase';
import {collection, onSnapshot} from '@react-native-firebase/firestore';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const {width} = Dimensions.get('window');

const Homescreen = () => {
  const navigation = useNavigation();
  const {user} = useAuth();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'products'),
      snapshot => {
        const productsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productsData);
        const categoriesData = productsData.map(product => ({
          id: product.id,
          name: product.category,
        }));
        const uniqueCategories = Array.from(
          new Set(categoriesData.map(cat => cat.name)),
        ).map(name => categoriesData.find(cat => cat.name === name));
        setCategories(uniqueCategories);
        setLoading(false);
      },
      error => {
        console.error('Error fetching products:', error);
        setLoading(false);
      },
    );
    return () => unsubscribe();
  }, []);

  const handleCategoryPress = category => {
    console.log('Navigating to Search with category:', category);
    navigation.navigate('BottomTab', {
      screen: 'Search',
      params: {category},
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary[600]} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, {paddingTop: insets.top}]}
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
      {/* <View style={styles.categoriesSection}>
        <SectionHeader
          title="Categories"
          actionText="See All"
          onActionPress={() =>
            navigation.navigate('BottomTab', { screen: 'Search' })
          }
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}>
          {categories.map(category => (
            <CategoryCard
              key={category.id}
              category={category.name}
              onPress={() => handleCategoryPress(category.name)}
            />
          ))}
        </ScrollView>
      </View> */}

      {/* Featured Products Section */}
      <View style={styles.section}>
        <SectionHeader
          title="Featured Products"
          actionText="See All"
          onActionPress={() =>
            navigation.navigate('BottomTab', {screen: 'Search'})
          }
        />
        <FlatList
          data={products}
          keyExtractor={item => item.id}
          renderItem={({item}) => <ProductCard product={item} />}
          contentContainerStyle={styles.productListContainer}
          ItemSeparatorComponent={() => <View style={{height: Spacing.sm}} />}
          style={styles.productList}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
        />
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
    paddingHorizontal: Spacing.padding['sm'],
  },
  productListContainer: {
    paddingBottom: Spacing.md,
  },
  productList: {
    marginTop: Spacing.md,
  },
  columnWrapper: {
    justifyContent: 'space-around',
  },
});

export default Homescreen;
