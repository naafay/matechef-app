// SearchScreen.tsx
// Browse & Search tab with filter menu, dish cards, and Add to Cart

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import FilterMenu, { FilterOption } from '../components/FilterMenu';
import { useCart } from '../context/CartContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Filter options (can expand as needed)
const FILTER_OPTIONS: FilterOption[] = [
  { key: 'all', label: 'All' },
  { key: 'vegetarian', label: 'Vegetarian' },
  { key: 'organic', label: 'Organic' },
  { key: 'glutenfree', label: 'Gluten-Free' },
  { key: 'chicken', label: 'Chicken' },
  { key: 'beef', label: 'Beef' },
  { key: 'fish', label: 'Fish' },
];

// Dummy dishes to demonstrate filtering
const DISHES = [
  {
    id: '1',
    name: 'Mediterranean Salad',
    chef: 'Chef Alice',
    price: 12.99,
    image: 'https://via.placeholder.com/150',
    tags: ['vegetarian', 'organic', 'all'],
  },
  {
    id: '2',
    name: 'Grilled Chicken',
    chef: 'Chef Ben',
    price: 15.49,
    image: 'https://via.placeholder.com/150',
    tags: ['chicken', 'all'],
  },
  {
    id: '3',
    name: 'Beef Tacos',
    chef: 'Chef Carla',
    price: 13.75,
    image: 'https://via.placeholder.com/150',
    tags: ['beef', 'all'],
  },
];

export default function SearchScreen() {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const { addItem, items } = useCart();
  const navigation = useNavigation<any>();

  // Filter dishes based on the selected tag
  const filteredDishes = DISHES.filter((dish) =>
    dish.tags.includes(activeFilter)
  );

  return (
    <View style={styles.container}>
      {/* Filter chips */}
      <FilterMenu
        options={FILTER_OPTIONS}
        selectedKey={activeFilter}
        onSelect={setActiveFilter}
      />

      {/* List of filtered dishes */}
      <FlatList
        data={filteredDishes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.cardContent}>
              <Text style={styles.dishName}>{item.name}</Text>
              <Text style={styles.chefName}>{item.chef}</Text>
              <Text style={styles.price}>${item.price.toFixed(2)}</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() =>
                  addItem({
                    id: item.id,
                    name: item.name,
                    chef: item.chef,
                    price: item.price,
                  })
                }
              >
                <Text style={styles.addText}>Add to Cart</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Floating “View Cart” button */}
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
  card: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
  },
  image: { width: 100, height: 100 },
  cardContent: { flex: 1, padding: 12 },
  dishName: { fontSize: 16, fontWeight: 'bold' },
  chefName: { fontSize: 14, color: '#555', marginVertical: 4 },
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
    elevation: 5, // shadow for Android
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
