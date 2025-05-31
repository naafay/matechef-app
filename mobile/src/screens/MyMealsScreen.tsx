// mobile/src/screens/MyMealsScreen.tsx

import React, { useContext, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { Colors } from '../theme';

const API_BASE_URL = 'http://10.0.2.2:8000';

function getImageUrl(imagePath?: string | null): string | null {
  if (!imagePath) return null;
  if (imagePath.startsWith('file:') || imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('/static/')) return API_BASE_URL + imagePath;
  return imagePath;
}

export default function MyMealsScreen() {
  const { user } = useContext(AuthContext);
  const [meals, setMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();

  // Refresh meals on focus
  useFocusEffect(
    useCallback(() => {
      if (!user?.chef_id) {
        setMeals([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      fetch(`${API_BASE_URL}/chefs/${user.chef_id}/dishes`)
        .then(res => res.json())
        .then(setMeals)
        .finally(() => setLoading(false));
    }, [user?.chef_id])
  );

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Meals</Text>
      <FlatList
        data={meals}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={<Text style={styles.empty}>No meals yet. Tap "Add Meal" to start.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('EditMeal', { meal: item })}
          >
            {getImageUrl(item.image) ? (
              <Image source={{ uri: getImageUrl(item.image) as string }} style={styles.image} />
            ) : (
              <View style={styles.imagePlaceholder}><Text>No Image</Text></View>
            )}
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
              <Text style={styles.price}>${item.price.toFixed(2)}</Text>
              <View style={styles.tags}>
                {item.is_kind ? <Text style={styles.tag}>Kind</Text> : null}
                {item.pickup_available ? <Text style={styles.tag}>Pickup</Text> : null}
                {item.delivery_available ? <Text style={styles.tag}>Delivery</Text> : null}
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddMeal')}>
        <Text style={styles.addTxt}>+ Add Meal</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.primary, marginBottom: 16, textAlign: 'center' },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 12, alignItems: 'center', elevation: 1 },
  image: { width: 70, height: 70, borderRadius: 8, marginRight: 16 },
  imagePlaceholder: { width: 70, height: 70, borderRadius: 8, marginRight: 16, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold', color: Colors.primary },
  desc: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  price: { fontSize: 14, fontWeight: '600', color: Colors.text, marginTop: 8 },
  tags: { flexDirection: 'row', marginTop: 4 },
  tag: { backgroundColor: Colors.secondary, borderRadius: 5, paddingHorizontal: 7, paddingVertical: 2, marginRight: 6, color: Colors.primary, fontSize: 12 },
  addBtn: { marginTop: 10, backgroundColor: Colors.primary, borderRadius: 8, padding: 16, alignItems: 'center' },
  addTxt: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  empty: { textAlign: 'center', color: Colors.textMuted, marginTop: 60 },
});
