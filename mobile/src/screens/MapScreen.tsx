// src/screens/MapScreen.tsx
// Home tab: Plates Nearby view with a horizontal filter menu

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import FilterMenu, { FilterOption } from '../components/FilterMenu';

export default function MapScreen() {
  // Track which filter is selected (default: All Chefs)
  const [activeFilter, setActiveFilter] = useState<string>('allChefs');

  // Define the filters as per your Feature Set
  const FILTER_OPTIONS: FilterOption[] = [
    { key: 'allChefs', label: 'All Chefs' },
    { key: 'favoriteChefs', label: 'Favorite Chefs' },
    { key: 'verifiedChefs', label: 'Verified Chefs' },
    { key: 'byRating', label: 'By Rating' },
    { key: 'freeMeals', label: 'Free Meals' },
    { key: 'readyForPickup', label: 'Ready for Pickup' },
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

      {/* Placeholder for map view; we'll wire up react-native-maps next */}
      <View style={styles.mapPlaceholder}>
        <Text style={styles.placeholderText}>
          {'[ Map appears here filtered by: ' +
            FILTER_OPTIONS.find((o) => o.key === activeFilter)?.label +
            ']'}
        </Text>
      </View>
    </View>
  );
}

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
  mapPlaceholder: {
    flex: 1,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#888',
    textAlign: 'center',
  },
});
