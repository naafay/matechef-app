// mobile/src/screens/SearchScreen.tsx
// — Filter chips + grouped-by-chef horizontal lists + dish detail navigation
// — Uses getChefs & getDishes from ../api (they include auth headers + correct URLs)

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import FilterMenu, { FilterOption } from '../components/FilterMenu';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { getDishes, Dish } from '../api/dishes';
import { getChefs, Chef } from '../api/chefs';
import { RootStackParamList } from '../../App';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const FILTER_OPTIONS: FilterOption[] = [
  { key: 'all', label: 'All' },
  { key: 'vegetarian', label: 'Vegetarian' },
  { key: 'organic', label: 'Organic' },
  { key: 'glutenfree', label: 'Gluten-Free' },
  { key: 'chicken', label: 'Chicken' },
  { key: 'beef', label: 'Beef' },
  { key: 'fish', label: 'Fish' },
];

const { width } = Dimensions.get('window');
const DISH_CARD_WIDTH = width * 0.6;

export default function SearchScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { addItem, items } = useCart();

  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [dishes, setDishes]     = useState<Dish[]>([]);
  const [chefs, setChefs]       = useState<Chef[]>([]);
  const [loading, setLoading]   = useState<boolean>(false);
  const [error, setError]       = useState<string | null>(null);

  // 1️⃣ Load chefs on mount
  useEffect(() => {
    let mounted = true;
    getChefs()
      .then(data => { if (mounted) setChefs(data); })
      .catch(e => {
        console.error('[SearchScreen] getChefs error', e);
        if (mounted) setError('Failed to load chefs');
      });
    return () => { mounted = false; };
  }, []);

  // 2️⃣ Load dishes whenever the filter changes
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const list = await getDishes(activeFilter === 'all' ? undefined : activeFilter);
        if (mounted) setDishes(list);
      } catch (e) {
        console.error('[SearchScreen] getDishes error', e);
        if (mounted) setError('Failed to load dishes');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [activeFilter]);

  // 3️⃣ Group dishes by chef
  const sections = chefs
    .map(c => ({ chef: c, dishes: dishes.filter(d => d.chef_id === c.id) }))
    .filter(sec => sec.dishes.length > 0);

  return (
    <View style={styles.container}>
      <FilterMenu
        options={FILTER_OPTIONS}
        selectedKey={activeFilter}
        onSelect={setActiveFilter}
      />

      {loading && <ActivityIndicator style={styles.loader} size="large" />}
      {!loading && error && <Text style={styles.error}>{error}</Text>}
      {!loading && !error && sections.length === 0 && (
        <Text style={styles.empty}>No dishes found.</Text>
      )}

      {!loading && !error && (
        <FlatList
          data={sections}
          keyExtractor={sec => sec.chef.id.toString()}
          renderItem={({ item: section }) => (
            <View style={styles.section}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('Profile', { chefId: section.chef.id })
                }
              >
                <Text style={styles.chefName}>{section.chef.name}</Text>
              </TouchableOpacity>

              <FlatList
                horizontal
                data={section.dishes}
                keyExtractor={d => d.id.toString()}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
                renderItem={({ item: d }) => (
                  <TouchableOpacity
                    style={styles.card}
                    onPress={() =>
                      navigation.navigate('DishDetail', { dish: d })
                    }
                  >
                    <Image
                      source={{ uri: d.image || 'https://via.placeholder.com/150' }}
                      style={styles.image}
                    />
                    <Text style={styles.dishName}>{d.name}</Text>
                    <Text style={styles.price}>${d.price.toFixed(2)}</Text>
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() =>
                        addItem({
                          id: d.id.toString(),
                          name: d.name,
                          chef: section.chef.name,
                          price: d.price,
                          quantity: 1,
                        })
                      }
                    >
                      <Text style={styles.addText}>Add to Cart</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                )}
              />
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
  loader:    { marginTop: 20 },
  error:     { color: 'red', textAlign: 'center', marginTop: 20 },
  empty:     { textAlign: 'center', marginTop: 20, color: '#555' },
  section:   { marginVertical: 12 },
  chefName: {
    fontSize: 20,
    fontWeight: '600',
    marginHorizontal: 16,
    marginBottom: 8,
    color: '#4CAF50',
    textDecorationLine: 'underline',
  },
  horizontalList: { paddingLeft: 8 },
  card: {
    width: DISH_CARD_WIDTH,
    marginHorizontal: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  image:     { width: DISH_CARD_WIDTH - 24, height: 100, borderRadius: 4 },
  dishName:  { fontSize: 16, fontWeight: 'bold', marginTop: 8 },
  price:     { fontSize: 14, marginVertical: 4 },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  addText:    { color: '#fff', fontSize: 14 },
  cartButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 32,
    elevation: 5,
  },
  badge:      {
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
  badgeText:  { color: '#fff', fontSize: 12 },
});
