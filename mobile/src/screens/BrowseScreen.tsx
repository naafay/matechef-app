// BrowseScreen.tsx
// Shows a list of chefs; tapping one navigates to that chef’s profile

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

// Props type for this screen’s navigation
type Props = NativeStackScreenProps<RootStackParamList, 'Browse'>;

// Temporary dummy data until we hook up the backend
const CHEFS = [
  { id: '1', name: 'Chef Alice' },
  { id: '2', name: 'Chef Ben' },
  { id: '3', name: 'Chef Carla' },
];

export default function BrowseScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      {/* Screen title */}
      <Text style={styles.title}>Browse by Chef</Text>

      {/* List of chefs */}
      <FlatList
        data={CHEFS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() =>
              // Navigate to Profile, passing the chef’s ID
              navigation.navigate('Profile', { chefId: item.id })
            }
          >
            <Text style={styles.itemText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  item: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  itemText: {
    fontSize: 18,
  },
});
