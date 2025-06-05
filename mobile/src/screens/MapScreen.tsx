// mobile/src/screens/MapScreen.tsx

import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import FilterMenu, { FilterOption } from '../components/FilterMenu';
import { getChefs, Chef, getChefDishes } from '../api/chefs';
import { Dish } from '../api/dishes';
import mapStyle from '../theme/mapStyle.json';
import { Colors } from '../theme';
import { AuthContext } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.05;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const INITIAL_REGION: Region = {
  latitude: -37.8136,
  longitude: 144.9631,
  latitudeDelta: LATITUDE_DELTA,
  longitudeDelta: LONGITUDE_DELTA,
};

const LOCATIONS: Record<number, { latitude: number; longitude: number }> = {
  1: { latitude: -37.8136, longitude: 144.9631 },
  2: { latitude: -37.8044, longitude: 144.9632 },
};

const FIRST_LAYER: FilterOption[] = [
  { key: 'top', label: 'Top Mates' },
  { key: 'verified', label: 'Verified Mates' },
  { key: 'kind', label: 'Kind Bites' },
  { key: 'ready', label: 'Ready-to-go' },
];

const GOLD_PIN = require('../../assets/marker-gold.png');
const GREEN_PIN = require('../../assets/marker-green.png');

export default function MapScreen() {
  const navigation = useNavigation<any>();
  const { user } = useContext(AuthContext);

  const [firstFilter, setFirstFilter] = useState<string>('top');
  const [chefs, setChefs] = useState<Chef[]>([]);
  const [dishCounts, setDishCounts] = useState<Record<number, Dish[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [region, setRegion] = useState<Region>(INITIAL_REGION);
  const [selectedChefId, setSelectedChefId] = useState<number | null>(null);
  const [selectedDishes, setSelectedDishes] = useState<Dish[]>([]);

  const markerRefs = useRef<Record<number, Marker | null>>({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const cs = await getChefs();
        if (!mounted) return;
        setChefs(cs);

        const counts: Record<number, Dish[]> = {};
        await Promise.all(
          cs.map(async (chef) => {
            counts[chef.id] = await getChefDishes(chef.id);
          })
        );
        if (mounted) setDishCounts(counts);
      } catch (e: any) {
        console.error('[MapScreen] loadData error', e);
        if (mounted) setError(e.message || 'Failed to load data');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (selectedChefId && dishCounts[selectedChefId]) {
      setSelectedDishes(dishCounts[selectedChefId]);
    } else {
      setSelectedDishes([]);
    }
  }, [selectedChefId, dishCounts]);

  const applyFirst = (chef: Chef) =>
    firstFilter === 'ready' ? (dishCounts[chef.id] || []).length > 0 : true;

  const visibleChefs = chefs.filter((chef) => {
    const loc = LOCATIONS[chef.id];
    if (!loc || !applyFirst(chef)) return false;
    const latMin = region.latitude - region.latitudeDelta / 2;
    const latMax = region.latitude + region.latitudeDelta / 2;
    const lonMin = region.longitude - region.longitudeDelta / 2;
    const lonMax = region.longitude + region.longitudeDelta / 2;
    return (
      loc.latitude >= latMin &&
      loc.latitude <= latMax &&
      loc.longitude >= lonMin &&
      loc.longitude <= lonMax
    );
  });

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ─── NEW: Top Welcome Card ─────────────────────────────────────────── */}
      <View style={styles.topCard}>
        <Text style={styles.cardGreeting}>
          {user ? `G’day, ${user.first_name}!` : 'G’day, Mate!'}
        </Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Favorites')}
          >
            <Text style={styles.actionButtonText}>Fave Mates’ Menu</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.getParent()?.navigate('MyMeals')}
          >
            <Text style={styles.actionButtonText}>Cook for Mates</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── “Plates Nearby” Heading shifted here ──────────────────────────── */}
      <Text style={styles.title}>Plates Nearby</Text>

      {/* ─── Filter Menu (spaced below title for breathing room) ─────────── */}
      <View style={styles.filterWrapper}>
        <FilterMenu
          options={FIRST_LAYER}
          selectedKey={firstFilter}
          onSelect={setFirstFilter}
        />
      </View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <>
          {/* ─── The Map ──────────────────────────────────────────────────────── */}
          <MapView
            style={styles.map}
            initialRegion={INITIAL_REGION}
            customMapStyle={mapStyle}
            onRegionChangeComplete={setRegion}
            onPress={() => setSelectedChefId(null)}
          >
            {visibleChefs.map((chef) => {
              const loc = LOCATIONS[chef.id]!;
              const isSelected = selectedChefId === chef.id;
              return (
                <Marker
                  key={chef.id}
                  coordinate={loc}
                  image={isSelected ? GREEN_PIN : GOLD_PIN}
                  ref={(ref) => {
                    markerRefs.current[chef.id] = ref;
                  }}
                  onPress={(e) => {
                    e.stopPropagation();
                    setSelectedChefId(chef.id);
                  }}
                  calloutAnchor={{ x: 0.5, y: 2 }}
                />
              );
            })}
          </MapView>

          {/* ─── Floating Chef-Dish Card ──────────────────────────────────── */}
          {selectedChefId && (
            <View style={styles.cardContainer}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardChefName}>
                  {chefs.find((c) => c.id === selectedChefId)?.name || 'Chef'}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('Profile', { chefId: selectedChefId })
                  }
                >
                  <Text style={styles.cardViewProfile}>View Profile</Text>
                </TouchableOpacity>
              </View>

              <FlatList
                data={selectedDishes}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.cardDishList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.cardDishItem}
                    onPress={() => navigation.navigate('DishDetail', { dish: item })}
                  >
                    <Text style={styles.cardDishName}>{item.name}</Text>
                    <Text style={styles.cardDishPrice}>
                      ${item.price.toFixed(2)}
                    </Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text style={styles.cardNoDishes}>No dishes available</Text>
                }
              />
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // ─── Loader / Error ───────────────────────────────────────────────────
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    color: Colors.danger,
  },

  // ─── NEW: Top Welcome Card ────────────────────────────────────────────
  topCard: {
    backgroundColor: Colors.primary,
    marginHorizontal: 16,
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginTop: Platform.OS === 'ios' ? 60 : 40,
    // subtle shadow
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 5,
  },
  cardGreeting: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.secondary,
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginHorizontal: 6,
    alignItems: 'center',
  },
  actionButtonText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },

  // ─── “Plates Nearby” ─────────────────────────────────────────────────
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginTop: 24,       // extra space between card and heading
    marginBottom: 8,     // small gap before filters
    color: Colors.primary,
  },

  // ─── Filter Menu Wrapper (adds a bit of padding) ─────────────────────
  filterWrapper: {
    marginHorizontal: 16,
    marginBottom: 12,
  },

  // ─── The Map ────────────────────────────────────────────────────────
  map: {
    flex: 1,
  },

  // ─── Floating Chef-Dish Card ─────────────────────────────────────────
  cardContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    // subtle shadow
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardChefName: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.primary,
  },
  cardViewProfile: {
    fontSize: 14,
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  cardDishList: {
    paddingVertical: 8,
  },
  cardDishItem: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  cardDishName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  cardDishPrice: {
    fontSize: 13,
    color: Colors.primary,
  },
  cardNoDishes: {
    fontSize: 14,
    color: Colors.textMuted,
    marginLeft: 8,
  },
});
