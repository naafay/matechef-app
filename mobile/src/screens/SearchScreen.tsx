// mobile/src/screens/SearchScreen.tsx

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import FilterMenu, { FilterOption } from '../components/FilterMenu';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { getChefs, Chef } from '../api/chefs';
import { getDishes, Dish } from '../api/dishes';
import { Colors } from '../theme';

type RootStackParamList = {
  Profile: { chefId: number };
  DishDetail: { dish: Dish };
  Cart: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.6;

// First layer
const L1: FilterOption[] = [
  { key: 'top', label: 'Top Mates' },
  { key: 'verified', label: 'Verified Mates' },
  { key: 'kind', label: 'Kind Bites' },
  { key: 'ready', label: 'Ready-to-go' },
];
// Second layer
const L2: FilterOption[] = [
  { key: 'all', label: 'All' },
  { key: 'vegetarian', label: 'Vegetarian' },
  { key: 'organic', label: 'Organic' },
  { key: 'glutenfree', label: 'Gluten-Free' },
  { key: 'chicken', label: 'Chicken' },
  { key: 'beef', label: 'Beef' },
  { key: 'fish', label: 'Fish' },
];
// Third layer
const L3: FilterOption[] = [
  { key: '5', label: '< 5 Km' },
  { key: '10', label: '< 10 Km' },
  { key: '50', label: '< 50 Km' },
];

// Dummy locations & user pos
const USER_LOC = { latitude: -37.8136, longitude: 144.9631 };
const LOCS: Record<number, { latitude: number; longitude: number }> = {
  1: { latitude: -37.8136, longitude: 144.9631 },
  2: { latitude: -37.8044, longitude: 144.9632 },
};

function distanceKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const x = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

export default function SearchScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { addItem, items } = useCart();

  const [l1, setL1] = useState<string>('top');
  const [l2, setL2] = useState<string>('all');
  const [l3, setL3] = useState<string>('50');

  const [chefs, setChefs] = useState<Chef[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let m = true;
    (async () => {
      setLoading(true);
      const cs = await getChefs();
      const ds = await getDishes(l2 === 'all' ? undefined : l2);
      if (m) {
        setChefs(cs);
        setDishes(ds);
        setLoading(false);
      }
    })();
    return () => {
      m = false;
    };
  }, [l2]);

  const applyL1 = (chef: Chef) => {
    if (l1 === 'ready') return dishes.some((d) => d.chef_id === chef.id);
    return true;
  };
  const maxD = Number(l3);
  const applyL3 = (chef: Chef) => {
    const loc = LOCS[chef.id];
    if (!loc) return false;
    return distanceKm(USER_LOC, loc) <= maxD;
  };

  const sections = useMemo(() => {
    return chefs
      .filter((c) => applyL1(c) && applyL3(c))
      .map((c) => ({
        chef: c,
        dishes: dishes.filter((d) => d.chef_id === c.id),
      }))
      .filter((sec) => sec.dishes.length > 0);
  }, [chefs, dishes, l1, l3]);

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 50 }} />;
  }

  return (
    <View style={styles.container}>
      <FilterMenu options={L1} selectedKey={l1} onSelect={setL1} />
      <FilterMenu options={L2} selectedKey={l2} onSelect={setL2} />
      <FilterMenu options={L3} selectedKey={l3} onSelect={setL3} />

      {sections.length === 0 ? (
        <Text style={styles.empty}>No chefs match your filters.</Text>
      ) : (
        <FlatList
          data={sections}
          keyExtractor={(sec) => sec.chef.id.toString()}
          renderItem={({ item: sec }) => (
            <View style={styles.section}>
              <TouchableOpacity
                onPress={() => navigation.navigate('Profile', { chefId: sec.chef.id })}
              >
                <Text style={styles.chefName}>{sec.chef.name}</Text>
              </TouchableOpacity>
              <FlatList
                horizontal
                data={sec.dishes}
                keyExtractor={(d) => d.id.toString()}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.hList}
                renderItem={({ item: d }) => (
                  <TouchableOpacity
                    style={styles.card}
                    onPress={() => navigation.navigate('DishDetail', { dish: d })}
                  >
                    <Image
                      source={{ uri: d.image || 'https://via.placeholder.com/150' }}
                      style={styles.img}
                    />
                    <Text style={styles.dName}>{d.name}</Text>
                    <Text style={styles.dPrice}>${d.price.toFixed(2)}</Text>
                    <TouchableOpacity
                      style={styles.addBtn}
                      onPress={() =>
                        addItem({
                          id: d.id.toString(),
                          name: d.name,
                          chef: sec.chef.name,
                          price: d.price,
                          quantity: 1,
                        })
                      }
                    >
                      <Text style={styles.addTxt}>Add</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        />
      )}

      <TouchableOpacity
        style={styles.cartBtn}
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
  container: { flex: 1, backgroundColor: Colors.background },
  empty: { textAlign: 'center', marginTop: 20, color: Colors.textMuted },
  section: { marginVertical: 12 },
  chefName: {
    fontSize: 20,
    fontWeight: '600',
    marginHorizontal: 16,
    marginBottom: 8,
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  hList: { paddingLeft: 8 },
  card: {
    width: CARD_WIDTH,
    marginHorizontal: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  img: { width: CARD_WIDTH - 24, height: 100, borderRadius: 4 },
  dName: { fontSize: 16, fontWeight: 'bold', marginTop: 8, color: Colors.text },
  dPrice: { fontSize: 14, marginVertical: 4, color: Colors.textMuted },
  addBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  addTxt: { color: '#fff', fontSize: 14 },
  cartBtn: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 32,
    elevation: 5,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: Colors.danger,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 12 },
});
