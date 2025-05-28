// mobile/src/components/FilterMenu.tsx
// A horizontal, scrollable menu of filter chips (e.g., All Chefs, Favorite Chefs, etc.)

import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';

// Defines the shape of each filter option
export type FilterOption = {
  key: string;   // unique identifier
  label: string; // the text shown on the chip
};

// Props for the FilterMenu component
type FilterMenuProps = {
  options: FilterOption[];        // array of filters to display
  selectedKey: string | null;     // which filter is active
  onSelect: (key: string) => void; // callback when a chip is tapped
};

export default function FilterMenu({
  options,
  selectedKey,
  onSelect,
}: FilterMenuProps) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {options.map((opt) => {
          const isSelected = opt.key === selectedKey;
          return (
            <TouchableOpacity
              key={opt.key}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => onSelect(opt.key)}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: 50,
    marginVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4CAF50',  // green outline
    marginRight: 8,
    backgroundColor: '#FFF',
  },
  chipSelected: {
    backgroundColor: '#4CAF50', // solid green when selected
  },
  chipText: {
    fontSize: 14,
    color: '#4CAF50',
  },
  chipTextSelected: {
    color: '#FFF',             // white text on selected chip
  },
});
