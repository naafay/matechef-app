// mobile/src/screens/MapScreen.tsx
// Home tab: Plates Nearby view with a real map and a horizontal filter menu

import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
// MapView and Marker from react-native-maps
import MapView, { Marker } from 'react-native-maps';
import FilterMenu, { FilterOption } from '../components/FilterMenu';

export default function MapScreen() {
  // Active filter state (default: show all chefs)
  const [activeFilter, setActiveFilter] = useState<string>('allChefs');

  // Define filters from your Feature Set
  const FILTER_OPTIONS: FilterOption[] = [
    { key: 'allChefs', label: 'All Chefs' },
    { key: 'favoriteChefs', label: 'Favorite Chefs' },
    { key: 'verifiedChefs', label: 'Verified Chefs' },
    { key: 'byRating', label: 'By Rating' },
    { key: 'freeMeals', label: 'Free Meals' },
    { key: 'readyForPickup', label: 'Ready for Pickup' },
  ];

  // Hard-coded chef locations for demonstration
  const CHEF_LOCATIONS = [
    {
      id: '1',
      name: 'Chef Alice',
      coords: { latitude: -37.8136, longitude: 144.9631 },
    },
    {
      id: '2',
      name: 'Chef Ben',
      coords: { latitude: -37.8044, longitude: 144.9632 },
    },
    {
      id: '3',
      name: 'Chef Carla',
      coords: { latitude: -37.8150, longitude: 144.9660 },
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header title */}
      <Text style={styles.title}>Plates Nearby</Text>

      {/* Horizontal filter menu */}
      <FilterMenu
        options={FILTER_OPTIONS}
        selectedKey={activeFilter}
        onSelect={setActiveFilter}
      />

      {/* Interactive map */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: -37.8136,
          longitude: 144.9631,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* Place a marker for each chef */}
        {CHEF_LOCATIONS.map((chef) => (
          <Marker
            key={chef.id}
            coordinate={chef.coords}
            title={chef.name}
          />
        ))}
      </MapView>
    </View>
  );
}

const { height, width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginTop: 48,
    marginBottom: 8,
  },
  map: {
    flex: 1,
    width: width,
    height: height - 150, // adjust to fit below the filters
  },
});
