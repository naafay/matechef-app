import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme';

const { height } = Dimensions.get('window');

type FilterCriteria = {
  mode: 'InPerson' | 'Remote' | 'All';
  categories: string[];
  location: string;
  distanceKm: number;
  priceRange: [number, number];
  showAvailableOnly: boolean;
  showNoFavoritesOnly: boolean;
};

type Props = {
  initialCriteria: FilterCriteria;
  onApply: (criteria: FilterCriteria) => void;
  onCancel: () => void;
};

export default function FilterModal({ initialCriteria, onApply, onCancel }: Props) {
  const [mode, setMode] = useState(initialCriteria.mode);
  const [categories, setCategories] = useState<string[]>([...initialCriteria.categories]);
  const [location, setLocation] = useState(initialCriteria.location);
  const [distanceKm, setDistanceKm] = useState(initialCriteria.distanceKm);
  const [priceRange, setPriceRange] = useState<[number, number]>([...initialCriteria.priceRange]);
  const [showAvailableOnly, setShowAvailableOnly] = useState(initialCriteria.showAvailableOnly);
  const [showNoFavoritesOnly, setShowNoFavoritesOnly] = useState(
    initialCriteria.showNoFavoritesOnly
  );

  const handleApply = () => {
    onApply({
      mode,
      categories,
      location,
      distanceKm,
      priceRange,
      showAvailableOnly,
      showNoFavoritesOnly,
    });
  };

  const handleReset = () => {
    setMode('All');
    setCategories([]);
    setLocation('Melbourne VIC, Australia');
    setDistanceKm(25);
    setPriceRange([5, 9999]);
    setShowAvailableOnly(false);
    setShowNoFavoritesOnly(false);
  };

  return (
    <View style={styles.container}>
      {/* ─── Header ───────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel}>
          <Ionicons name="close" size={28} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Filters</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* ─── Categories (placeholder) ─────────────────────────────────────── */}
        <Text style={styles.label}>Categories</Text>
        <TouchableOpacity style={styles.dropdown}>
          <Text style={styles.dropdownText}>Select categories</Text>
          <Ionicons name="chevron-down" size={20} color={Colors.textMuted} />
        </TouchableOpacity>

        {/* ─── To be done ───────────────────────────────────────────────────── */}
        <Text style={[styles.label, { marginTop: 24 }]}>To be done</Text>
        <View style={styles.toggleRow}>
          {['InPerson', 'Remote', 'All'].map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[
                styles.toggleButton,
                mode === opt && styles.toggleButtonActive,
              ]}
              onPress={() => setMode(opt as any)}
            >
              <Text
                style={[
                  styles.toggleText,
                  mode === opt && styles.toggleTextActive,
                ]}
              >
                {opt === 'InPerson'
                  ? 'In person'
                  : opt === 'Remote'
                  ? 'Remotely'
                  : 'All'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ─── Location ───────────────────────────────────────────────────────── */}
        <Text style={[styles.label, { marginTop: 24 }]}>Location</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter location"
          placeholderTextColor={Colors.textMuted}
          value={location}
          onChangeText={setLocation}
        />

        {/* ─── Distance Slider ───────────────────────────────────────────────── */}
        <Text style={[styles.label, { marginTop: 24 }]}>
          Distance: {distanceKm} km
        </Text>
        <Slider
          style={{ width: '100%', height: 40 }}
          minimumValue={1}
          maximumValue={100}
          step={1}
          value={distanceKm}
          onValueChange={(v) => setDistanceKm(Math.round(v))}
          minimumTrackTintColor={Colors.primary}
          maximumTrackTintColor="#ddd"
          thumbTintColor={Colors.primary}
        />

        {/* ─── Price Slider ─────────────────────────────────────────────────── */}
        <Text style={[styles.label, { marginTop: 24 }]}>
          Price: ${priceRange[0]} – ${priceRange[1]}
        </Text>
        <View style={styles.priceRow}>
          <Slider
            style={{ flex: 1, height: 40, marginRight: 8 }}
            minimumValue={5}
            maximumValue={5000}
            step={1}
            value={priceRange[0]}
            onValueChange={(v) => setPriceRange([Math.round(v), priceRange[1]])}
            minimumTrackTintColor={Colors.primary}
            maximumTrackTintColor="#ddd"
            thumbTintColor={Colors.primary}
          />
          <Slider
            style={{ flex: 1, height: 40 }}
            minimumValue={5}
            maximumValue={9999}
            step={1}
            value={priceRange[1]}
            onValueChange={(v) => setPriceRange([priceRange[0], Math.round(v)])}
            minimumTrackTintColor={Colors.primary}
            maximumTrackTintColor="#ddd"
            thumbTintColor={Colors.primary}
          />
        </View>

        {/* ─── Other Filters ─────────────────────────────────────────────────── */}
        <Text style={[styles.subtitle, { marginTop: 32 }]}>Other filters</Text>

        <View style={styles.switchRow}>
          <Text style={styles.switchText}>Available meals only</Text>
          <Switch
            value={showAvailableOnly}
            onValueChange={setShowAvailableOnly}
            trackColor={{ false: '#ccc', true: Colors.primary }}
            thumbColor={showAvailableOnly ? '#fff' : '#fff'}
          />
        </View>
        <Text style={styles.switchSubText}>
          Hide meals that are already taken
        </Text>

        <View style={[styles.switchRow, { marginTop: 16 }]}>
          <Text style={styles.switchText}>Show meals with no favourites</Text>
          <Switch
            value={showNoFavoritesOnly}
            onValueChange={setShowNoFavoritesOnly}
            trackColor={{ false: '#ccc', true: Colors.primary }}
            thumbColor={showNoFavoritesOnly ? '#fff' : '#fff'}
          />
        </View>
        <Text style={styles.switchSubText}>
          Hide meals that are already popular
        </Text>
      </ScrollView>

      {/* ─── Reset / Apply Buttons ───────────────────────────────────────────── */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
          <Text style={styles.applyText}>Apply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  // ─── Header ─────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: Colors.primary,
  },

  // ─── Scroll Content ────────────────────────────────────────────────────
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textMuted,
  },

  // ─── Dropdown placeholder ───────────────────────────────────────────────
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'space-between',
    marginTop: 8,
  },
  dropdownText: {
    fontSize: 15,
    color: Colors.textMuted,
  },

  // ─── Toggle buttons (In person / Remotely / All) ───────────────────────
  toggleRow: {
    flexDirection: 'row',
    marginTop: 8,
    justifyContent: 'space-between',
  },
  toggleButton: {
    flex: 1,
    backgroundColor: '#F2F2F2',
    borderRadius: 20,
    paddingVertical: 10,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: Colors.primary,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  toggleTextActive: {
    color: '#fff',
  },

  // ─── TextInput for Location ─────────────────────────────────────────────
  textInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.text,
    marginTop: 8,
  },

  // ─── Switch rows ───────────────────────────────────────────────────────
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text,
  },
  switchSubText: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 4,
  },

  // ─── Footer (Reset / Apply) ────────────────────────────────────────────
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  resetButton: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  resetText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  applyButton: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  applyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
