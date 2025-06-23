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
  Animated,
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
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryPath, setCategoryPath] = useState([]);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [selectedCategory]);

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
        if (initialCategory && !selectedCategory) {
          const matchingCategory = categoriesData.find(
            cat => cat.name === initialCategory,
          );
          if (matchingCategory) {
            setSelectedCategory(matchingCategory);
            setCategoryPath([matchingCategory]);
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

  const getAllSubCategoryNames = categoryId => {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return [];
    const subCategories = categories.filter(cat => cat.parentId === categoryId);
    const subCategoryNames = subCategories.flatMap(subCat => [
      subCat.name,
      ...getAllSubCategoryNames(subCat.id),
    ]);
    return [category.name, ...subCategoryNames];
  };

  const chunkArray = (array, size) => {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  };

  const fetchProductsForCategories = (categoryNames, callback) => {
    if (categoryNames.length === 0) {
      callback([]);
      return;
    }

    const chunks = chunkArray(categoryNames, 30);
    const unsubscribeFuncs = [];
    let combinedProducts = [];
    let completedQueries = 0;

    chunks.forEach(chunk => {
      const q = query(
        collection(db, 'products'),
        where('category', 'in', chunk),
      );
      const unsubscribe = onSnapshot(
        q,
        snapshot => {
          const productsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          combinedProducts = [
            ...combinedProducts.filter(
              p1 => !productsData.some(p2 => p2.id === p1.id),
            ),
            ...productsData,
          ];
          completedQueries++;
          if (completedQueries === chunks.length) {
            callback(combinedProducts);
          }
        },
        error => {
          console.error(error);
          completedQueries++;
          if (completedQueries === chunks.length) {
            callback(combinedProducts);
          }
        },
      );
      unsubscribeFuncs.push(unsubscribe);
    });

    return () => unsubscribeFuncs.forEach(unsubscribe => unsubscribe());
  };

  useEffect(() => {
    let categoryNames;
    if (!selectedCategory) {
      const mainCategoryIds = mainCategories.map(cat => cat.id);
      categoryNames = mainCategoryIds.flatMap(id => getAllSubCategoryNames(id));
    } else {
      categoryNames = getAllSubCategoryNames(selectedCategory.id);
    }

    const unsubscribe = fetchProductsForCategories(categoryNames, products => {
      setSearchResults(products);
      setLoading(false);
    });

    return unsubscribe;
  }, [selectedCategory, categories, mainCategories]);

  const handleSearch = query => {
    setSearchQuery(query);
    let categoryNames;
    if (!selectedCategory) {
      const mainCategoryIds = mainCategories.map(cat => cat.id);
      categoryNames = mainCategoryIds.flatMap(id => getAllSubCategoryNames(id));
    } else {
      categoryNames = getAllSubCategoryNames(selectedCategory.id);
    }

    const unsubscribe = fetchProductsForCategories(categoryNames, products => {
      const filteredProducts = query.trim()
        ? products.filter(product =>
            product.name.toLowerCase().includes(query.toLowerCase()),
          )
        : products;
      setSearchResults(filteredProducts);
    });

    return unsubscribe;
  };

  const getSubCategories = parentId => {
    return categories.filter(category => category.parentId === parentId);
  };

  const handleCategorySelect = category => {
    fadeAnim.setValue(0);
    setSelectedCategory(category);
    const existingIndex = categoryPath.findIndex(cat => cat.id === category.id);
    if (existingIndex !== -1) {
      setCategoryPath(categoryPath.slice(0, existingIndex + 1));
    } else {
      setCategoryPath([...categoryPath, category]);
    }
    setSearchQuery('');
  };

  const clearSearch = () => {
    setSearchQuery('');
    let categoryNames;
    if (!selectedCategory) {
      const mainCategoryIds = mainCategories.map(cat => cat.id);
      categoryNames = mainCategoryIds.flatMap(id => getAllSubCategoryNames(id));
    } else {
      categoryNames = getAllSubCategoryNames(selectedCategory.id);
    }

    fetchProductsForCategories(categoryNames, products => {
      setSearchResults(products);
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
            {selectedCategory
              ? ` in "${selectedCategory.name}" or its subcategories`
              : ' in any category'}
          </Text>
        </View>
      );
    }

    if (searchResults.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateTitle}>No products found</Text>
          <Text style={styles.emptyStateText}>
            No products available
            {selectedCategory
              ? ` in the "${selectedCategory.name}" category or its subcategories`
              : ' in any category'}
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

  const renderCategories = () => {
    const categoriesToShow = selectedCategory
      ? getSubCategories(selectedCategory.id)
      : mainCategories;

    if (categoriesToShow.length === 0 && selectedCategory) {
      return null;
    }

    return (
      <Animated.View style={[styles.categoriesContainer, {opacity: fadeAnim}]}>
        <Text style={styles.categoryTitle}>
          {selectedCategory ? `${selectedCategory.name}` : 'Categories'}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScrollContainer}>
          {categoriesToShow.map(category => (
            <CategoryCard
              key={category.id}
              category={category.name}
              isSelected={selectedCategory?.id === category.id}
              onPress={() => handleCategorySelect(category)}
            />
          ))}
        </ScrollView>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover Products</Text>
        {categoryPath.length > 0 && (
          <Animated.View
            style={[styles.breadcrumbContainer, {opacity: fadeAnim}]}>
            <TouchableOpacity
              onPress={() => {
                setSelectedCategory(null);
                setCategoryPath([]);
              }}>
              <Text
                style={[
                  styles.breadcrumb,
                  !selectedCategory && styles.breadcrumbActive,
                ]}>
                All
              </Text>
            </TouchableOpacity>
            {categoryPath.map((cat, index) => (
              <React.Fragment key={cat.id}>
                <Text style={styles.breadcrumbSeparator}>{'>'}</Text>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedCategory(cat);
                    setCategoryPath(categoryPath.slice(0, index + 1));
                  }}>
                  <Text
                    style={[
                      styles.breadcrumb,
                      selectedCategory?.id === cat.id &&
                        styles.breadcrumbActive,
                    ]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </Animated.View>
        )}
      </View>

      <View style={styles.searchContainer}>
        <SearchIcon size={20} color={Colors.neutral[600]} />
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
            <X size={20} color={Colors.neutral[600]} />
          </TouchableOpacity>
        )}
      </View>

      {renderCategories()}

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
    paddingBottom: Spacing.sm,
  },
  title: {
    fontFamily: Typography.fonts.bold,
    fontSize: Typography.sizes.xxl,
    color: Colors.text.primary,
  },
  breadcrumbContainer: {
    flexDirection: 'row',
    marginTop: Spacing.sm,
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  breadcrumb: {
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[600],
    backgroundColor: Colors.neutral[100],
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.radius.sm,
    marginRight: Spacing.xs,
  },
  breadcrumbActive: {
    color: Colors.text.inverse,
    backgroundColor: Colors.primary[600],
  },
  breadcrumbSeparator: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[400],
    marginHorizontal: Spacing.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[50],
    borderRadius: Spacing.radius.lg,
    marginHorizontal: Spacing.lg,
    paddingHorizontal: Spacing.md,
    marginVertical: Spacing.md,
    shadowColor: Colors.neutral[900],
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
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
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.sm,
    backgroundColor: Colors.neutral[50],
    borderRadius: Spacing.radius.lg,
  },
  categoriesScrollContainer: {
    paddingVertical: Spacing.sm,
  },
  categoryTitle: {
    fontFamily: Typography.fonts.semiBold,
    fontSize: Typography.sizes.lg,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.md,
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
