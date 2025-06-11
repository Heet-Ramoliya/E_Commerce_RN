import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {Search as SearchIcon, X} from 'lucide-react-native';
import Colors from '../../constants/Colors';
import Spacing from '../../constants/Spacing';
import Typography from '../../constants/Typography';
import ProductCard from '../../components/ProductCard';
import CategoryCard from '../../components/CategoryCard';
import {
  collection,
  onSnapshot,
  query,
  where,
} from '@react-native-firebase/firestore';
import {db} from '../../config/firebase';
import {useNavigation, useRoute} from '@react-navigation/native';

export default function SearchScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const {category} = route.params || {};

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(
    category ? category.toLowerCase() : null,
  );
  const [loading, setLoading] = useState(true);

  console.log('Route category:', category);
  console.log('Selected category:', selectedCategory);

  useEffect(() => {
    // Fetch categories
    const unsubscribeCategories = onSnapshot(
      collection(db, 'products'),
      snapshot => {
        const categoriesData = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().category,
        }));
        const uniqueCategories = Array.from(
          new Set(categoriesData.map(cat => cat.name)),
        ).map(name => categoriesData.find(cat => cat.name === name));
        setCategories(uniqueCategories);
        // Validate route category
        if (category && !selectedCategory) {
          const matchedCategory = uniqueCategories.find(
            cat => cat.name.toLowerCase() === category.toLowerCase(),
          );
          if (matchedCategory) {
            setSelectedCategory(matchedCategory.name.toLowerCase());
          }
        }
        setLoading(false);
      },
      error => {
        console.error('Error fetching categories:', error);
        setLoading(false);
      },
    );

    return () => unsubscribeCategories();
  }, [category]);

  useEffect(() => {
    // Fetch products based on searchQuery or selectedCategory
    let unsubscribeProducts;

    console.log(
      'Fetching products for searchQuery:',
      searchQuery,
      'selectedCategory:',
      selectedCategory,
    );

    if (searchQuery.trim()) {
      // Search products by name (case-insensitive)
      const q = query(
        collection(db, 'products'),
        where('name', '>=', searchQuery),
        where('name', '<=', searchQuery + '\uf8ff'),
      );
      unsubscribeProducts = onSnapshot(
        q,
        snapshot => {
          const productsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          console.log('Search results:', productsData);
          setSearchResults(productsData);
        },
        error => {
          console.error('Error searching products:', error);
          setSearchResults([]);
        },
      );
    } else if (selectedCategory) {
      // Filter products by category
      const q = query(
        collection(db, 'products'),
        where('category', '==', selectedCategory),
      );
      unsubscribeProducts = onSnapshot(
        q,
        snapshot => {
          const productsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          console.log('Category products:', productsData);
          setSearchResults(productsData);
        },
        error => {
          console.error('Error fetching products by category:', error);
          setSearchResults([]);
        },
      );
    } else {
      setSearchResults([]);
    }

    return () => {
      if (unsubscribeProducts) unsubscribeProducts();
    };
  }, [searchQuery, selectedCategory]);

  const handleSearch = query => {
    setSearchQuery(query);
  };

  const handleCategorySelect = categoryName => {
    console.log('Selecting category:', categoryName);
    setSelectedCategory(categoryName);
    setSearchQuery('');
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.emptyStateContainer}>
          <ActivityIndicator size="large" color={Colors.primary[600]} />
        </View>
      );
    }

    if (searchQuery.trim() && searchResults.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateTitle}>No results found</Text>
          <Text style={styles.emptyStateText}>
            We couldn't find any products matching "{searchQuery}"
          </Text>
        </View>
      );
    }

    if (selectedCategory && searchResults.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateTitle}>No products found</Text>
          <Text style={styles.emptyStateText}>
            No products available in the "{selectedCategory}" category
          </Text>
        </View>
      );
    }

    if (!selectedCategory && !searchQuery.trim()) {
      return (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateTitle}>Find products</Text>
          <Text style={styles.emptyStateText}>
            Search for products or select a category to start browsing
          </Text>
        </View>
      );
    }

    return null;
  };

  const renderItem = ({item}) => (
    <View style={styles.productCardContainer}>
      <ProductCard product={item} />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover Products</Text>
      </View>

      <View style={styles.searchContainer}>
        <SearchIcon size={18} color={Colors.neutral[500]} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor={Colors.neutral[400]}
          value={searchQuery}
          onChangeText={handleSearch}
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={clearSearch}>
            <X size={18} color={Colors.neutral[500]} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.categoriesContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScrollContainer}>
          {categories.map(category => (
            <CategoryCard
              key={category.id}
              category={category.name}
              isSelected={selectedCategory === category.name}
              onPress={() => handleCategorySelect(category.name)}
            />
          ))}
        </ScrollView>
      </View>

      {searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.resultsContainer}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        renderEmptyState()
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.md,
  },
  title: {
    fontFamily: Typography.fonts.semiBold,
    fontSize: Typography.sizes.xxl,
    color: Colors.text.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[100],
    borderRadius: Spacing.radius.md,
    marginHorizontal: Spacing.lg,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  searchInput: {
    flex: 1,
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.md,
    color: Colors.text.primary,
    paddingVertical: Spacing.md,
    marginLeft: Spacing.sm,
  },
  categoriesContainer: {
    marginBottom: Spacing.md,
  },
  categoriesScrollContainer: {
    paddingHorizontal: Spacing.lg,
  },
  resultsContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  productCardContainer: {
    marginBottom: Spacing.md,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyStateTitle: {
    fontFamily: Typography.fonts.semiBold,
    fontSize: Typography.sizes.xl,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  emptyStateText: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.md,
    color: Colors.text.tertiary,
    textAlign: 'center',
    lineHeight: Typography.lineHeights.normal * Typography.sizes.md,
  },
});
