// mobile/src/screens/MapScreen.tsx

import React, { useState, useEffect, useRef } from 'react';
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
      <Text style={styles.title}>Plates Nearby</Text>

      <FilterMenu
        options={FIRST_LAYER}
        selectedKey={firstFilter}
        onSelect={setFirstFilter}
      />

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <>
          <MapView
            style={styles.map}
            initialRegion={INITIAL_REGION}
            customMapStyle={mapStyle}
            onRegionChangeComplete={setRegion}
            onPress={() => setSelectedChefId(null)} // Hides panel on map press
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
                    e.stopPropagation(); // Prevents map onPress firing too
                    setSelectedChefId(chef.id);
                  }}
                  calloutAnchor={{ x: 0.5, y: 2 }}
                />
              );
            })}
          </MapView>

          {selectedChefId && (
            <View style={styles.bottomPanel}>
              <View style={styles.panelHeader}>
                <Text style={styles.panelChefName}>
                  {chefs.find((c) => c.id === selectedChefId)?.name || 'Chef'}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('Profile', { chefId: selectedChefId })
                  }
                >
                  <Text style={styles.panelViewProfile}>View Profile</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={selectedDishes}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 6 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.dishItem}
                    onPress={() => navigation.navigate('DishDetail', { dish: item })}
                  >
                    <Text style={styles.dishName}>{item.name}</Text>
                    <Text style={styles.dishPrice}>${item.price.toFixed(2)}</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={styles.noDishes}>No dishes available</Text>}
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginTop: Platform.OS === 'ios' ? 60 : 40,
    marginBottom: 8,
    color: Colors.primary,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    flex: 1,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    color: Colors.danger,
  },
  bottomPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 12,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  panelChefName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  panelViewProfile: {
    fontSize: 14,
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  dishItem: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  dishName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  dishPrice: {
    fontSize: 13,
    color: Colors.primary,
  },
  noDishes: {
    fontSize: 14,
    color: Colors.textMuted,
    marginLeft: 8,
  },
});
