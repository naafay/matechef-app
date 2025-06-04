// mobile/src/screens/FeederDashboardScreen.tsx

import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { Colors } from '../theme';
import { getChefDishes, Dish } from '../api/chefs';

export default function FeederDashboardScreen() {
  const { user, token, refreshUser } = useContext(AuthContext);
  const navigation = useNavigation<any>();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchMeals() {
      if (!user) return;
      setLoading(true);
      try {
        const result = await getChefDishes(user.id);
        if (isMounted) setDishes(result);
      } catch (e: any) {
        Alert.alert('Error', 'Failed to load meals.');
      }
      setLoading(false);
    }
    fetchMeals();
    return () => {
      isMounted = false;
    };
  }, [user]);

  function handleAddMeal() {
    navigation.getParent()?.navigate('MyMeals', { screen: 'AddMeal' });
  }

  function handleEditMeal(dish: Dish) {
    navigation.getParent()?.navigate('MyMeals', { screen: 'EditMeal', params: { meal: dish } });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Meals</Text>
      <TouchableOpacity style={styles.addBtn} onPress={handleAddMeal}>
        <Text style={styles.addBtnText}>+ Add Meal</Text>
      </TouchableOpacity>
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : dishes.length === 0 ? (
        <Text style={styles.emptyText}>You haven't added any meals yet.</Text>
      ) : (
        <FlatList
          data={dishes}
          keyExtractor={(d) => d.id.toString()}
          contentContainerStyle={{ paddingBottom: 30 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.mealCard}
              onPress={() => handleEditMeal(item)}
            >
              <Image
                source={
                  item.image
                    ? { uri: item.image }
                    : require('../../assets/mc_logo_header.png')
                }
                style={styles.mealImage}
              />
              <View style={styles.mealInfo}>
                <Text style={styles.mealName}>{item.name}</Text>
                <Text style={styles.mealDesc} numberOfLines={2}>
                  {item.description}
                </Text>
                <Text style={styles.mealPrice}>${item.price.toFixed(2)}</Text>
                {item.is_kind && (
                  <Text style={styles.kindMeal}>Kind Meal (Free)</Text>
                )}
                {item.prep_time === 0 && (
                  <Text style={styles.readyTag}>Ready to go</Text>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 16 },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 10,
    marginTop: 20,
    textAlign: 'center',
  },
  addBtn: {
    backgroundColor: Colors.primary,
    alignSelf: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 28,
    marginBottom: 18,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 18,
    marginTop: 32,
    textAlign: 'center',
  },
  mealCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 8,
    padding: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  mealImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: Colors.secondary,
  },
  mealInfo: {
    flex: 1,
    marginLeft: 16,
  },
  mealName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  mealDesc: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 3,
    marginBottom: 2,
  },
  mealPrice: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  kindMeal: {
    fontSize: 13,
    color: Colors.accent,
    fontWeight: 'bold',
    marginTop: 2,
  },
  readyTag: {
    fontSize: 12,
    color: Colors.secondary,
    marginTop: 2,
    fontWeight: 'bold',
  },
});
