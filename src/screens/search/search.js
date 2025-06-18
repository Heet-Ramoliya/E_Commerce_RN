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
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export default function SearchScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const {category: initialCategory} = route.params || {};
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [selectedCategoryPath, setSelectedCategoryPath] = useState([]);
  const [loading, setLoading] = useState(true);

  console.log('selectedCategoryPath ======> ', selectedCategoryPath);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'categories'),
      snapshot => {
        const categoriesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCategories(categoriesData);
        const mainCategories = categoriesData.filter(
          category => category.parentId === null,
        );
        setMainCategories(mainCategories);
        if (initialCategory && selectedCategoryPath.length === 0) {
          const matchingCategory = categoriesData.find(
            cat => cat.name === initialCategory,
          );
          if (matchingCategory) {
            setSelectedCategoryPath([matchingCategory]);
          }
        }
        setLoading(false);
      },
      error => {
        console.error(error);
        setLoading(false);
      },
    );
    return () => unsubscribe();
  }, [initialCategory]);

  useEffect(() => {
    let q;
    if (selectedCategoryPath.length === 0) {
      q = collection(db, 'products');
    } else {
      const lastCategory =
        selectedCategoryPath[selectedCategoryPath.length - 1];
      q = query(
        collection(db, 'products'),
        where('category', '==', lastCategory.name),
      );
    }

    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const productsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSearchResults(productsData);
        setLoading(false);
      },
      error => {
        console.error(error);
        setLoading(false);
      },
    );
    return () => unsubscribe();
  }, [selectedCategoryPath]);

  // Handle search query
  const handleSearch = query => {
    setSearchQuery(query);
    if (query.trim()) {
      // Search products by name
      const q = collection(db, 'products');
      const unsubscribe = onSnapshot(
        q,
        snapshot => {
          const productsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          const filteredProducts = productsData.filter(product =>
            product.name.toLowerCase().includes(query.toLowerCase()),
          );
          setSearchResults(filteredProducts);
        },
        error => console.error(error),
      );
      return () => unsubscribe();
    } else {
      let q;
      if (selectedCategoryPath.length === 0) {
        q = collection(db, 'products');
      } else {
        const lastCategory =
          selectedCategoryPath[selectedCategoryPath.length - 1];
        q = query(
          collection(db, 'products'),
          where('category', '==', lastCategory.name),
        );
      }
      onSnapshot(q, snapshot => {
        const productsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSearchResults(productsData);
      });
    }
  };

  const getSubCategories = parentId => {
    return categories.filter(category => category.parentId === parentId);
  };

  const handleCategorySelect = category => {
    console.log('Selecting category:', category);
    if (category.parentId === null) {
      setSelectedCategoryPath([category]);
    } else {
      const existingIndex = selectedCategoryPath.findIndex(
        cat => cat.id === category.id,
      );
      if (existingIndex !== -1) {
        setSelectedCategoryPath(
          selectedCategoryPath.slice(0, existingIndex + 1),
        );
      } else {
        const parentIndex = selectedCategoryPath.findIndex(
          cat => cat.id === category.parentId,
        );
        if (parentIndex !== -1) {
          setSelectedCategoryPath([
            ...selectedCategoryPath.slice(0, parentIndex + 1),
            category,
          ]);
        } else {
          setSelectedCategoryPath([...selectedCategoryPath, category]);
        }
      }
    }
    setSearchQuery('');
  };

  const clearSearch = () => {
    setSearchQuery('');

    let q;
    if (selectedCategoryPath.length === 0) {
      q = collection(db, 'products');
    } else {
      const lastCategory =
        selectedCategoryPath[selectedCategoryPath.length - 1];
      q = query(
        collection(db, 'products'),
        where('category', '==', lastCategory.name),
      );
    }
    onSnapshot(q, snapshot => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSearchResults(productsData);
    });
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

    if (searchResults.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateTitle}>No products found</Text>
          <Text style={styles.emptyStateText}>
            {selectedCategoryPath.length > 0
              ? `No products available in the "${
                  selectedCategoryPath[selectedCategoryPath.length - 1].name
                }" category`
              : 'No products available'}
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

  const renderCategoryLevel = (categories, level) => {
    if (categories.length === 0) return null;
    return (
      <View style={styles.categoriesContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScrollContainer}>
          {categories.map(category => (
            <CategoryCard
              key={category.id}
              category={category.name}
              isSelected={selectedCategoryPath.some(
                cat => cat.id === category.id,
              )}
              onPress={() => handleCategorySelect(category)}
            />
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderCategoryHierarchy = () => {
    const levels = [];
    levels.push(renderCategoryLevel(mainCategories, 0));
    selectedCategoryPath.forEach((selectedCategory, index) => {
      const subCategories = getSubCategories(selectedCategory.id);
      levels.push(renderCategoryLevel(subCategories, index + 1));
    });
    return levels;
  };

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover Products</Text>
        {selectedCategoryPath.length > 0 && (
          <Text style={styles.breadcrumb}>
            {selectedCategoryPath.map(cat => cat.name).join(' > ')}
          </Text>
        )}
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

      {renderCategoryHierarchy()}

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
  breadcrumb: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
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
    paddingEnd: Spacing.md,
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
