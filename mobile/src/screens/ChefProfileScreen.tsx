// mobile/src/screens/ChefProfileScreen.tsx

import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { getChefs, getChefDishes, Chef } from '../api/chefs';
import { Dish } from '../api/dishes';
import { addFavorite, removeFavorite } from '../api/user';
import { getAuthHeaders } from '../api/authHeaders';
import { API_BASE_URL } from '../api/config';
import { AuthContext } from '../context/AuthContext';
import { Colors } from '../theme';

type RootStackParamList = {
  Profile: { chefId: number };
  DishDetail: { dish: Dish };
};

type ProfileRoute = RouteProp<RootStackParamList, 'Profile'>;
type NavProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

export default function ChefProfileScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute<ProfileRoute>();
  const navigation = useNavigation<NavProp>();
  const { token } = useContext(AuthContext);
  const chefId = route.params.chefId;

  const [chef, setChef] = useState<Chef | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const headers = await getAuthHeaders();
        const meRes = await fetch(`${API_BASE_URL}/users/me`, { headers });
        if (!meRes.ok) throw new Error('Fetch user failed');
        const me = await meRes.json();
        if (mounted) setIsFavorite(me.favorites.includes(chefId));

        const allChefs = await getChefs();
        const found = allChefs.find((c) => c.id === chefId);
        if (!found) throw new Error('Chef not found');
        const chefDs = await getChefDishes(chefId);

        if (mounted) {
          setChef(found);
          setDishes(chefDs);
        }
      } catch (e: any) {
        Alert.alert('Error', e.message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [chefId]);

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await removeFavorite(chefId);
      } else {
        await addFavorite(chefId);
      }
      setIsFavorite(!isFavorite);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  if (loading || !chef) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.name}>{chef.name}</Text>
        <TouchableOpacity onPress={toggleFavorite}>
          <Ionicons
            name={isFavorite ? 'star' : 'star-outline'}
            size={28}
            color={isFavorite ? Colors.accent : Colors.textMuted}
          />
        </TouchableOpacity>
      </View>

      {chef.bio ? <Text style={styles.bio}>{chef.bio}</Text> : null}

      <Text style={styles.sectionTitle}>Dishes</Text>
      <FlatList
        data={dishes}
        keyExtractor={(d) => d.id.toString()}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.dishItem}
            onPress={() =>
              navigation.navigate('DishDetail', { dish: item })
            }
          >
            <Text style={styles.dishName}>{item.name}</Text>
            <Text style={styles.dishPrice}>${item.price.toFixed(2)}</Text>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loader: { flex: 1, justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.primary,
  },
  bio: {
    marginHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    color: Colors.textMuted,
  },
  sectionTitle: {
    marginHorizontal: 16,
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
  },
  dishItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  dishName: { fontSize: 16, color: Colors.text },
  dishPrice: { fontSize: 16, fontWeight: '600', color: Colors.text },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginHorizontal: 16,
  },
});
