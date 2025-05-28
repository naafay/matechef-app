// ChefProfileScreen.tsx
// Displays chef details (name, bio) and their dishes fetched from the backend

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { getChefs, getChefDishes, Chef } from '../api/chefs';
import { Dish } from '../api/dishes';
import { useNavigation } from '@react-navigation/native';

// Props type for navigation & route params
type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export default function ChefProfileScreen({ route }: Props) {
  const { chefId } = route.params;
  const navigation = useNavigation<any>();

  const [chef, setChef] = useState<Chef | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadData() {
      try {
        // 1. Fetch all chefs, find the matching one
        const chefs = await getChefs();
        const found = chefs.find((c) => c.id === chefId);
        if (!found) {
          throw new Error('Chef not found');
        }

        // 2. Fetch that chef’s dishes
        const chefDishes = await getChefDishes(chefId);

        if (isActive) {
          setChef(found);
          setDishes(chefDishes);
        }
      } catch (e: any) {
        if (isActive) setError(e.message);
      } finally {
        if (isActive) setLoading(false);
      }
    }

    loadData();

    return () => {
      isActive = false;
    };
  }, [chefId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Error: {error}</Text>
      </View>
    );
  }
  if (!chef) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Chef not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Chef header */}
      <Text style={styles.name}>{chef.name}</Text>
      {chef.bio && <Text style={styles.bio}>{chef.bio}</Text>}

      {/* Dishes list */}
      <Text style={styles.sectionTitle}>Popular Dishes</Text>
      {dishes.length === 0 ? (
        <Text style={styles.empty}>No dishes available.</Text>
      ) : (
        <FlatList
          data={dishes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.dishItem}>
              <Text style={styles.dishName}>{item.name}</Text>
              <Text style={styles.dishPrice}>${item.price.toFixed(2)}</Text>
            </View>
          )}
        />
      )}

      {/* Order from Chef button */}
      <TouchableOpacity
        style={styles.orderButton}
        onPress={() =>
          navigation.navigate('Search', {
            // pre-select a filter or pass chefId as needed later
          })
        }
      >
        <Text style={styles.orderText}>Order from {chef.name}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 48,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  error: { color: 'red' },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bio: {
    fontSize: 16,
    color: '#555',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  empty: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
  },
  dishItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  dishName: { fontSize: 16 },
  dishPrice: { fontSize: 16, fontWeight: '500' },
  orderButton: {
    marginTop: 24,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  orderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
