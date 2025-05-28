// mobile/src/screens/MapScreen.tsx
// MapScreen: tapping a marker opens a bottom info panel with dynamic height

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { getChefs, Chef, getChefDishes } from '../api/chefs';
import { Dish } from '../api/dishes';

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

// Demo coordinates for each chef
const LOCATIONS: Record<number, { latitude: number; longitude: number }> = {
  1: { latitude: -37.8136, longitude: 144.9631 },
  2: { latitude: -37.8044, longitude: 144.9632 },
};

export default function MapScreen() {
  const navigation = useNavigation<any>();

  const [chefs, setChefs]             = useState<Chef[]>([]);
  const [dishCounts, setDishCounts]   = useState<Record<number, Dish[]>>({});
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [region, setRegion]           = useState<Region>(INITIAL_REGION);
  const [selectedChef, setSelectedChef] = useState<Chef | null>(null);

  // Load chefs + dishes once
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const apiChefs = await getChefs();
        if (!mounted) return;
        setChefs(apiChefs);

        const counts: Record<number, Dish[]> = {};
        await Promise.all(
          apiChefs.map(async (c) => {
            counts[c.id] = await getChefDishes(c.id);
          })
        );
        if (mounted) setDishCounts(counts);
      } catch (e: any) {
        console.error('[MapScreen] loadData error', e);
        if (mounted) setError(e.message || 'Failed to load map data');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Filter chefs by the visible map bounds
  const visibleChefs = chefs.filter((chef) => {
    const loc = LOCATIONS[chef.id];
    if (!loc) return false;
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Plates Nearby</Text>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <MapView
          style={styles.map}
          initialRegion={INITIAL_REGION}
          onRegionChangeComplete={setRegion}
        >
          {visibleChefs.map((chef) => {
            const loc = LOCATIONS[chef.id];
            return (
              <Marker
                key={chef.id}
                coordinate={loc}
                onPress={() => setSelectedChef(chef)}
              />
            );
          })}
        </MapView>
      )}

      {selectedChef && (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>{selectedChef.name}</Text>
          <Text style={styles.panelText}>
            Dishes: {dishCounts[selectedChef.id]?.length ?? 0}
          </Text>
          {dishCounts[selectedChef.id]
            ?.filter((d) => d.name.toLowerCase().includes('grilled'))
            .length > 0 && (
            <Text style={styles.panelText}>
              Ready-to-go:{' '}
              {
                dishCounts[selectedChef.id].filter((d) =>
                  d.name.toLowerCase().includes('grilled')
                ).length
              }
            </Text>
          )}
          {dishCounts[selectedChef.id]
            ?.filter((d) => d.price === 0)
            .length > 0 && (
            <Text style={styles.panelText}>
              Free:{' '}
              {
                dishCounts[selectedChef.id].filter((d) => d.price === 0)
                  .length
              }
            </Text>
          )}
          <View style={styles.panelButtons}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                navigation.navigate('Profile', {
                  chefId: selectedChef.id,
                });
                setSelectedChef(null);
              }}
            >
              <Text style={styles.buttonText}>View Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.closeButton]}
              onPress={() => setSelectedChef(null)}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const PANEL_MAX_HEIGHT = height * 0.5;

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginTop: Platform.OS === 'ios' ? 60 : 40,
    marginBottom: 8,
  },
  loader: { textAlign: 'center', marginTop: 20, color: '#555' },
  errorText: { textAlign: 'center', marginTop: 20, color: 'red' },
  map: { flex: 1 },
  panel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    maxHeight: PANEL_MAX_HEIGHT,
  },
  panelTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  panelText: { fontSize: 16, marginBottom: 4 },
  panelButtons: { flexDirection: 'row', marginTop: 8 },
  button: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 4,
    alignItems: 'center',
  },
  closeButton: { backgroundColor: '#999' },
  buttonText: { color: '#fff', fontSize: 16 },
});
