// mobile/src/screens/SearchScreen.tsx
// “Search” tab: filter chips + real dishes from FastAPI, with robust loading & error handling

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import FilterMenu, { FilterOption } from '../components/FilterMenu';
import { useCart } from '../context/CartContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getDishes, Dish } from '../api/dishes';

const FILTER_OPTIONS: FilterOption[] = [
  { key: 'all', label: 'All' },
  { key: 'vegetarian', label: 'Vegetarian' },
  { key: 'organic', label: 'Organic' },
  { key: 'glutenfree', label: 'Gluten-Free' },
  { key: 'chicken', label: 'Chicken' },
  { key: 'beef', label: 'Beef' },
  { key: 'fish', label: 'Fish' },
];

export default function SearchScreen() {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { addItem, items } = useCart();
  const navigation = useNavigation<any>();

  useEffect(() => {
    let isMounted = true;

    async function fetchDishes() {
      console.log('[SearchScreen] fetchDishes, filter =', activeFilter);
      try {
        if (isMounted) {
          setLoading(true);
          setError(null);
        }
        const data = await getDishes(
          activeFilter === 'all' ? undefined : activeFilter
        );
        console.log('[SearchScreen] fetched dishes:', data);
        if (isMounted) setDishes(data);
      } catch (e: any) {
        console.error('[SearchScreen] fetch error:', e);
        if (isMounted) setError(e.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchDishes();
    return () => {
      isMounted = false;
    };
  }, [activeFilter]);

  return (
    <View style={styles.container}>
      <FilterMenu
        options={FILTER_OPTIONS}
        selectedKey={activeFilter}
        onSelect={setActiveFilter}
      />

      {loading && <ActivityIndicator style={styles.loader} size="large" />}

      {!loading && error && (
        <Text style={styles.error}>Error fetching dishes: {error}</Text>
      )}

      {!loading && !error && dishes.length === 0 && (
        <Text style={styles.empty}>
          No dishes found for "{activeFilter}"
        </Text>
      )}

      {!loading && !error && dishes.length > 0 && (
        <FlatList
          data={dishes}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image
                source={{ uri: 'https://via.placeholder.com/150' }}
                style={styles.image}
              />
              <View style={styles.cardContent}>
                <Text style={styles.dishName}>{item.name}</Text>
                <Text
                  style={styles.chefName}
                  onPress={() =>
                    navigation.navigate('Profile', { chefId: item.chef_id })
                  }
                >
                  Chef {item.chef_id}
                </Text>
                <Text style={styles.price}>${item.price.toFixed(2)}</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() =>
                    addItem({
                      id: item.id.toString(),
                      name: item.name,
                      chef: `Chef ${item.chef_id}`,
                      price: item.price,
                      quantity: 1,
                    })
                  }
                >
                  <Text style={styles.addText}>Add to Cart</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <TouchableOpacity
        style={styles.cartButton}
        onPress={() => navigation.navigate('Cart')}
      >
        <Ionicons name="cart" size={28} color="#fff" />
        {items.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{items.length}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loader: { marginTop: 20 },
  error: { color: 'red', textAlign: 'center', marginTop: 20 },
  empty: { textAlign: 'center', marginTop: 20, color: '#555' },
  card: {
    flexDirection: 'row',
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
  },
  image: { width: 100, height: 100 },
  cardContent: { flex: 1, padding: 12 },
  dishName: { fontSize: 16, fontWeight: 'bold' },
  chefName: {
    fontSize: 14,
    color: '#4CAF50',
    marginVertical: 4,
    textDecorationLine: 'underline',
  },
  price: { fontSize: 14, marginBottom: 8 },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  addText: { color: '#fff', fontSize: 14 },
  cartButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 32,
    elevation: 5,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#d00',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 12 },
});
