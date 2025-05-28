// mobile/src/components/FilterMenu.tsx

import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { Colors } from '../theme';

export interface FilterOption {
  key: string;
  label: string;
}

interface Props {
  options: FilterOption[];
  selectedKey: string;
  onSelect: (key: string) => void;
}

export default function FilterMenu({ options, selectedKey, onSelect }: Props) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {options.map(opt => {
          const isActive = opt.key === selectedKey;
          return (
            <TouchableOpacity
              key={opt.key}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => onSelect(opt.key)}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const CHIP_HEIGHT = 36;
const WRAPPER_HEIGHT = CHIP_HEIGHT + 16; // 8px vertical padding top/bottom

const styles = StyleSheet.create({
  wrapper: {
    height: WRAPPER_HEIGHT,
    backgroundColor: Colors.background,
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  chip: {
    height: CHIP_HEIGHT,
    marginRight: 12,
    paddingHorizontal: 16,
    borderRadius: CHIP_HEIGHT / 2,
    borderWidth: 1,
    borderColor: Colors.primary,
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  chipText: {
    fontSize: 14,
    color: Colors.primary,
  },
  chipTextActive: {
    color: Colors.text,
    fontWeight: '600',
  },
});
