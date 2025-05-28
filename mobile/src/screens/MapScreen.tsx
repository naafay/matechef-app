// mobile/src/screens/MapScreen.tsx

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
import FilterMenu, { FilterOption } from '../components/FilterMenu';
import { getChefs, Chef, getChefDishes } from '../api/chefs';
import { Dish } from '../api/dishes';
import mapStyle from '../theme/mapStyle.json';
import { Colors } from '../theme';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO      = width / height;
const LATITUDE_DELTA    = 0.05;
const LONGITUDE_DELTA   = LATITUDE_DELTA * ASPECT_RATIO;

// Melbourne CBD
const INITIAL_REGION: Region = {
  latitude:       -37.8136,
  longitude:      144.9631,
  latitudeDelta:  LATITUDE_DELTA,
  longitudeDelta: LONGITUDE_DELTA,
};

// Demo coords per chef ID
const LOCATIONS: Record<number, { latitude: number; longitude: number }> = {
  1: { latitude: -37.8136, longitude: 144.9631 },
  2: { latitude: -37.8044, longitude: 144.9632 },
};

// First-layer filters
const FIRST_LAYER: FilterOption[] = [
  { key: 'top',      label: 'Top Mates' },
  { key: 'verified', label: 'Verified Mates' },
  { key: 'kind',     label: 'Kind Bites' },
  { key: 'ready',    label: 'Ready-to-go' },
];

// Marker images
const GOLD_PIN  = require('../../assets/marker-gold.png');
const GREEN_PIN = require('../../assets/marker-green.png');

export default function MapScreen() {
  const navigation = useNavigation<any>();

  const [firstFilter, setFirstFilter]       = useState<string>('top');
  const [chefs, setChefs]                   = useState<Chef[]>([]);
  const [dishCounts, setDishCounts]         = useState<Record<number, Dish[]>>({});
  const [loading, setLoading]               = useState<boolean>(true);
  const [error, setError]                   = useState<string | null>(null);
  const [region, setRegion]                 = useState<Region>(INITIAL_REGION);
  const [selectedChef, setSelectedChef]     = useState<Chef | null>(null);
  const [selectedChefId, setSelectedChefId] = useState<number | null>(null);

  // Load chefs + their dishes
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const cs = await getChefs();
        if (!mounted) return;
        setChefs(cs);

        const counts: Record<number, Dish[]> = {};
        await Promise.all(
          cs.map(async chef => {
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
    return () => { mounted = false; };
  }, []);

  // Filter logic for “ready-to-go”
  const applyFirst = (chef: Chef) => {
    if (firstFilter === 'ready') {
      return (dishCounts[chef.id] || []).length > 0;
    }
    // stub for other filters: show all
    return true;
  };

  // Which chefs to show on the map
  const visibleChefs = chefs.filter(chef => {
    const loc = LOCATIONS[chef.id];
    if (!loc || !applyFirst(chef)) return false;
    const latMin = region.latitude  - region.latitudeDelta  / 2;
    const latMax = region.latitude  + region.latitudeDelta  / 2;
    const lonMin = region.longitude - region.longitudeDelta / 2;
    const lonMax = region.longitude + region.longitudeDelta / 2;
    return (
      loc.latitude  >= latMin &&
      loc.latitude  <= latMax &&
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
        <MapView
          style={styles.map}
          initialRegion={INITIAL_REGION}
          customMapStyle={mapStyle}
          onRegionChangeComplete={setRegion}
        >
          {visibleChefs.map(chef => {
            const loc = LOCATIONS[chef.id]!;
            const isSelected = selectedChefId === chef.id;
            return (
              <Marker
                key={chef.id}
                coordinate={loc}
                image={isSelected ? GREEN_PIN : GOLD_PIN}
                onPress={() => {
                  setSelectedChef(chef);
                  setSelectedChefId(chef.id);
                }}
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
            ?.filter(d => d.name.toLowerCase().includes('grilled'))
            .length > 0 && (
            <Text style={styles.panelText}>
              Ready-to-go:{' '}
              {
                dishCounts[selectedChef.id].filter(d =>
                  d.name.toLowerCase().includes('grilled')
                ).length
              }
            </Text>
          )}
          {dishCounts[selectedChef.id]
            ?.filter(d => d.price === 0)
            .length > 0 && (
            <Text style={styles.panelText}>
              Free:{' '}
              {
                dishCounts[selectedChef.id].filter(d => d.price === 0)
                  .length
              }
            </Text>
          )}

          <View style={styles.panelButtons}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                navigation.navigate('Profile', { chefId: selectedChef.id });
                setSelectedChef(null);
                setSelectedChefId(null);
              }}
            >
              <Text style={styles.buttonText}>View Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.closeButton]}
              onPress={() => {
                setSelectedChef(null);
                setSelectedChefId(null);
              }}
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
  panel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.textMuted,
    maxHeight: PANEL_MAX_HEIGHT,
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: Colors.primary,
  },
  panelText: {
    fontSize: 16,
    marginBottom: 4,
    color: Colors.text,
  },
  panelButtons: {
    flexDirection: 'row',
    marginTop: 8,
  },
  button: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 4,
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: Colors.textMuted,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
