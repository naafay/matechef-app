// mobile/src/screens/ChefProfileScreen.tsx
// Displays chef details and navigates into the Search tab pre-filtered to this chef

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
import { useNavigation } from '@react-navigation/native';
import { getChefs, getChefDishes, Chef } from '../api/chefs';
import { Dish } from '../api/dishes';
import { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export default function ChefProfileScreen({ route }: Props) {
  const { chefId } = route.params;
  const navigation = useNavigation<Props['navigation']>();

  const [chef, setChef] = useState<Chef | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    async function load() {
      try {
        setLoading(true);
        const all = await getChefs();
        const found = all.find((c) => c.id === chefId);
        if (!found) throw new Error('Chef not found');
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
    load();
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
  if (error || !chef) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Error: {error ?? 'Chef not found'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{chef.name}</Text>
      {chef.bio && <Text style={styles.bio}>{chef.bio}</Text>}

      <Text style={styles.sectionTitle}>Dishes by {chef.name}</Text>
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

      <TouchableOpacity
        style={styles.orderButton}
        onPress={() =>
          // Jump into the Main (tabs) navigator, opening the Search tab
          navigation.navigate('Main', {
            screen: 'Search',
            params: { chefId },
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
