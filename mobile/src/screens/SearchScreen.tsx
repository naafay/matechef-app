// mobile/src/screens/SearchScreen.tsx

import React, {
  useState,
  useEffect,
  useMemo,
  useContext,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TouchableWithoutFeedback,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCart } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
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
const CARD_PADDING = 16;
const CARD_WIDTH = width - CARD_PADDING * 2;

const MEAL_CATEGORIES = [
  'All',
  'Breakfast',
  'Lunch',
  'Dinner',
  'Dessert',
  'Snack',
  'Vegan',
  'Vegetarian',
  'Gluten-Free',
];

export default function SearchScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { addItem, items } = useCart();
  const { user } = useContext(AuthContext);

  // ─── MODAL VISIBILITY ────────────────
  const [filterVisible, setFilterVisible] = useState(false);
  const [sortVisible, setSortVisible] = useState(false);

  // ─── FILTER STATE ────────────────
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [toBeDone, setToBeDone] = useState<'All' | 'Pickup' | 'Delivery'>('All');
  const [distanceKm, setDistanceKm] = useState(25);
  const [priceMax, setPriceMax] = useState(1000);
  const [hideNoImage, setHideNoImage] = useState(false);

  // ─── SORT STATE ────────────────
  const SORT_OPTIONS = [
    'Newest',
    'Price: Low → High',
    'Price: High → Low',
    'Closest',
  ];
  const [selectedSort, setSelectedSort] = useState('Newest');

  // ─── DATA FETCHING ────────────────
  const [chefs, setChefs] = useState<Chef[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const ds =
        selectedCategory === 'All'
          ? await getDishes()
          : await getDishes(selectedCategory);
      const cs = await getChefs();
      if (!mounted) return;
      setDishes(ds);
      setChefs(cs);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [selectedCategory]);

  // ─── LOCATION HELPERS ────────────────
  const USER_LOC = { latitude: -37.8136, longitude: 144.9631 };
  const LOCS: Record<number, { latitude: number; longitude: number }> = {
    1: { latitude: -37.8136, longitude: 144.9631 },
    2: { latitude: -37.8044, longitude: 144.9632 },
  };
  function distanceBetween(
    a: { latitude: number; longitude: number },
    b: { latitude: number; longitude: number }
  ) {
    const toRad = (d: number) => (d * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(b.latitude - a.latitude);
    const dLon = toRad(b.longitude - a.longitude);
    const lat1 = toRad(a.latitude);
    const lat2 = toRad(b.latitude);
    const x =
      Math.sin(dLat / 2) ** 2 +
      Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  }

  // ─── FILTER + SORT LOGIC ────────────────
  const filteredMeals = useMemo(() => {
    // Build an array of { meal, chef } pairs
    const pairs: { meal: Dish; chef: Chef }[] = [];
    chefs.forEach((chef) => {
      dishes
        .filter((d) => d.chef_id === chef.id)
        .forEach((m) => pairs.push({ meal: m, chef }));
    });

    let result = pairs;

    // 1) EXCLUDE the user's own meals
    if (user?.chef_id) {
      result = result.filter((p) => p.meal.chef_id !== user.chef_id);
    }

    // 2) hide meals without images
    if (hideNoImage) {
      result = result.filter((p) => !!p.meal.image);
    }

    // 3) To Be Done
    if (toBeDone !== 'All') {
      result = result.filter((p) => {
        if (toBeDone === 'Pickup') return p.meal.pickup_available;
        if (toBeDone === 'Delivery') return p.meal.delivery_available;
        return true;
      });
    }

    // 4) Distance ≤ distanceKm
    result = result.filter((p) => {
      const coords = LOCS[p.chef.id];
      if (!coords) return false;
      const d = distanceBetween(USER_LOC, coords);
      return d <= distanceKm;
    });

    // 5) Price ≤ priceMax
    result = result.filter((p) => p.meal.price <= priceMax);

    // 6) Sort
    switch (selectedSort) {
      case 'Newest':
        return result.sort((a, b) => b.meal.id - a.meal.id);
      case 'Price: Low → High':
        return result.sort((a, b) => a.meal.price - b.meal.price);
      case 'Price: High → Low':
        return result.sort((a, b) => b.meal.price - a.meal.price);
      case 'Closest':
        return result.sort((a, b) => {
          const da = distanceBetween(USER_LOC, LOCS[a.chef.id]);
          const db = distanceBetween(USER_LOC, LOCS[b.chef.id]);
          return da - db;
        });
      default:
        return result;
    }
  }, [
    chefs,
    dishes,
    user,
    hideNoImage,
    toBeDone,
    distanceKm,
    priceMax,
    selectedSort,
  ]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ─── HEADER ROW ───────────────────────────────────────────────────────────── */}
      <View style={styles.headerRow}>
        <Ionicons
          name="filter-outline"
          size={24}
          color={Colors.primary}
          onPress={() => setFilterVisible(true)}
          style={{ marginRight: 12 }}
        />
        <Text style={styles.headerTitle}>Find Meals</Text>
        <View style={{ flex: 1 }} />
        <Ionicons
          name="map-outline"
          size={24}
          color={Colors.primary}
          onPress={() => navigation.navigate('Map')}
          style={{ marginRight: 20 }}
        />
        <Ionicons
          name="swap-vertical-outline"
          size={24}
          color={Colors.primary}
          onPress={() => setSortVisible(true)}
        />
      </View>

      {/* ─── MEAL LIST ───────────────────────────────────────────────────────────── */}
      {filteredMeals.length === 0 ? (
        <Text style={styles.emptyText}>No meals match your filters.</Text>
      ) : (
        <FlatList
          data={filteredMeals}
          keyExtractor={(p) => `${p.chef.id}-${p.meal.id}`}
          contentContainerStyle={{ padding: CARD_PADDING }}
          renderItem={({ item: { meal, chef } }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('DishDetail', { dish: meal })}
            >
              {meal.image ? (
                <Image source={{ uri: meal.image }} style={styles.cardImage} />
              ) : (
                <View style={styles.cardImagePlaceholder}>
                  <Ionicons name="image-outline" size={32} color="#bbb" />
                </View>
              )}
              <View style={styles.cardTextContainer}>
                <Text style={styles.mealName}>{meal.name}</Text>
                <Text style={styles.byChef}>By {chef.name}</Text>
                <View style={styles.locationRow}>
                  <Ionicons
                    name="location-outline"
                    size={14}
                    color={Colors.textMuted}
                  />
                  <Text style={styles.locationText}>
                    Melbourne VIC, Australia
                  </Text>
                </View>
                <View style={styles.pillsRow}>
                  {meal.is_kind && (
                    <View
                      style={[styles.pill, { backgroundColor: '#8BC34A' }]}
                    >
                      <Text style={styles.pillText}>Kind Free</Text>
                    </View>
                  )}
                  {meal.pickup_available && (
                    <View
                      style={[styles.pill, { backgroundColor: '#FDD835' }]}
                    >
                      <Text style={styles.pillText}>Pickup</Text>
                    </View>
                  )}
                  {meal.delivery_available && (
                    <View
                      style={[styles.pill, { backgroundColor: '#FFA000' }]}
                    >
                      <Text style={styles.pillText}>Delivery</Text>
                    </View>
                  )}
                </View>
              </View>
              <Text style={styles.priceText}>${meal.price.toFixed(2)}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* ─── CART BUTTON ───────────────────────────────────────────────────────────── */}
      <TouchableOpacity
        style={styles.cartBtn}
        onPress={() => navigation.navigate('Cart')}
      >
        <Ionicons name="cart" size={24} color="#fff" />
        {items.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{items.length}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* ─── FILTER MODAL ───────────────────────────────────────────────────────────── */}
      <Modal
        animationType="slide"
        transparent
        visible={filterVisible}
        onRequestClose={() => setFilterVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setFilterVisible(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.filterModal}>
          <Text style={styles.modalTitle}>Filters</Text>

          {/* Categories */}
          <Text style={styles.modalLabel}>Categories</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedCategory}
              onValueChange={(val) => setSelectedCategory(val)}
            >
              {MEAL_CATEGORIES.map((cat) => (
                <Picker.Item key={cat} label={cat} value={cat} />
              ))}
            </Picker>
          </View>

          {/* To Be Done */}
          <Text style={styles.modalLabel}>To be done</Text>
          <View style={styles.toggleRow}>
            {['All', 'Pickup', 'Delivery'].map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.toggleButton,
                  toBeDone === opt && { backgroundColor: Colors.primary },
                ]}
                onPress={() => setToBeDone(opt as any)}
              >
                <Text
                  style={[
                    styles.toggleButtonText,
                    toBeDone === opt && { color: '#fff' },
                  ]}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Distance */}
          <Text style={styles.modalLabel}>
            Distance (km) ≤ {distanceKm} km
          </Text>
          <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={1}
            maximumValue={100}
            step={1}
            minimumTrackTintColor={Colors.primary}
            maximumTrackTintColor="#ccc"
            thumbTintColor={Colors.primary}
            value={distanceKm}
            onValueChange={(v) => setDistanceKm(v)}
          />

          {/* Price */}
          <Text style={styles.modalLabel}>Price ≤ ${priceMax}</Text>
          <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={0}
            maximumValue={1000}
            step={5}
            minimumTrackTintColor={Colors.primary}
            maximumTrackTintColor="#ccc"
            thumbTintColor={Colors.primary}
            value={priceMax}
            onValueChange={(v) => setPriceMax(v)}
          />

          {/* Other Filters */}
          <Text style={[styles.modalLabel, { marginTop: 16 }]}>
            Other Filters
          </Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Hide meals with no images</Text>
            <Switch
              trackColor={{ false: '#ccc', true: Colors.primary }}
              thumbColor="#fff"
              value={hideNoImage}
              onValueChange={setHideNoImage}
            />
          </View>

          {/* Buttons */}
          <View style={styles.modalButtonsRow}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => {
                setSelectedCategory('All');
                setToBeDone('All');
                setDistanceKm(25);
                setPriceMax(1000);
                setHideNoImage(false);
              }}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setFilterVisible(false)}
            >
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ─── SORT MODAL ────────────────────────────────────────────────────────────── */}
      <Modal
        animationType="fade"
        transparent
        visible={sortVisible}
        onRequestClose={() => setSortVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setSortVisible(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.sortModal}>
          <Text style={styles.modalTitle}>Sort by</Text>
          {SORT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={styles.sortOptionRow}
              onPress={() => {
                setSelectedSort(opt);
                setSortVisible(false);
              }}
            >
              <Text
                style={[
                  styles.sortOptionText,
                  selectedSort === opt && { color: Colors.primary, fontWeight: '600' },
                ]}
              >
                {opt}
              </Text>
              {selectedSort === opt && (
                <Ionicons name="checkmark" size={18} color={Colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ─── HEADER ROW ─────────────────────────────────────────────────────────────
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    elevation: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.primary,
  },

  // ─── EMPTY STATE ────────────────────────────────────────────────────────────
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: Colors.textMuted,
    fontSize: 16,
  },

  // ─── MEAL CARD ──────────────────────────────────────────────────────────────
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  cardImage: {
    width: 100,
    height: 100,
    borderRadius: 0,
  },
  cardImagePlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTextContainer: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  byChef: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  locationText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginLeft: 4,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  pill: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  pillText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    alignSelf: 'center',
    marginRight: 12,
  },

  // ─── CART BUTTON ─────────────────────────────────────────────────────────────
  cartBtn: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 28,
    elevation: 4,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: Colors.danger,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },

  // ─── MODAL OVERLAY ───────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000066',
  },

  // ─── FILTER MODAL (SLIDE-UP) ─────────────────────────────────────────────────
  filterModal: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  toggleButtonText: {
    textAlign: 'center',
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  switchLabel: {
    fontSize: 14,
    color: Colors.text,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  resetButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    marginRight: 12,
  },
  resetButtonText: {
    textAlign: 'center',
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
  },
  applyButtonText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // ─── SORT MODAL (BOTTOM CARD) ─────────────────────────────────────────────────
  sortModal: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    elevation: 5,
  },
  sortOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  sortOptionText: {
    fontSize: 14,
    color: Colors.text,
  },
});
