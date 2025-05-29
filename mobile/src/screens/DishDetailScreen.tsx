// mobile/src/screens/DishDetailScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../App';
import { getChefs, Chef } from '../api/chefs';
import { useCart } from '../context/CartContext';

type Props = NativeStackScreenProps<RootStackParamList, 'DishDetail'>;

export default function DishDetailScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { dish } = route.params;
  const [chef, setChef] = useState<Chef | null>(null);
  const [loadingChef, setLoadingChef] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    let mounted = true;
    getChefs()
      .then(all => {
        if (!mounted) return;
        const found = all.find(c => c.id === dish.chef_id) || null;
        setChef(found);
      })
      .catch(e => console.error('[DishDetail] getChefs error', e))
      .finally(() => {
        if (mounted) setLoadingChef(false);
      });
    return () => { mounted = false; };
  }, [dish.chef_id]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        style={styles.container}
      >
        <Image
          source={{
            uri: dish.image || 'https://via.placeholder.com/400x200',
          }}
          style={styles.image}
        />

        <View style={styles.content}>
          <Text style={styles.name}>{dish.name}</Text>
          <Text style={styles.price}>${dish.price.toFixed(2)}</Text>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            {dish.description || 'No description available.'}
          </Text>

          <Text style={styles.sectionTitle}>Chef</Text>
          {loadingChef ? (
            <ActivityIndicator size="small" />
          ) : chef ? (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Profile', { chefId: chef.id })
              }
            >
              <Text style={styles.chefLink}>{chef.name}</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.description}>Unknown Chef</Text>
          )}

          <TouchableOpacity
            style={styles.addButton}
            onPress={() =>
              addItem({
                id: dish.id.toString(),
                name: dish.name,
                chef: chef?.name || `Chef ${dish.chef_id}`,
                price: dish.price,
                quantity: 1,
              })
            }
          >
            <Text style={styles.addText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  image: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    color: '#4CAF50',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
    color: '#555',
  },
  chefLink: {
    fontSize: 16,
    color: '#4CAF50',
    textDecorationLine: 'underline',
  },
  addButton: {
    marginTop: 24,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
