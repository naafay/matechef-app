// BrowseScreen.tsx
// Standalone list of chefs (navigate here with navigation.navigate('Profile',{chefId}))

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

// Props for navigation
type Props = NativeStackScreenProps<RootStackParamList, 'Browse'>;

// Dummy data until you fetch real chefs
const CHEFS = [
  { id: 1, name: 'Chef Alice' },
  { id: 2, name: 'Chef Ben' },
  { id: 3, name: 'Chef Carla' },
];

export default function BrowseScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Browse by Chef</Text>
      <FlatList
        data={CHEFS}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() =>
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
  container: { flex: 1, paddingTop: 48, backgroundColor: '#fff' },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  itemText: { fontSize: 18 },
});
