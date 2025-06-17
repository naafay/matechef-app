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
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { getChefs, Chef } from '../api/chefs';
import { Colors } from '../theme';
import { API_BASE_URL } from '../api/config'; // ← Import added

type DishDetailScreenProps = {
  route: {
    params: {
      dish: any;
    };
  };
  navigation: any;
};

export default function DishDetailScreen({ route, navigation }: DishDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const { dish } = route.params;
  const [chef, setChef] = useState<Chef | null>(null);
  const [loadingChef, setLoadingChef] = useState(true);
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  // ─── PREFIX any /static/... with API_BASE_URL ───────────────────────────────
  function getImageUrl(imagePath?: string | null): string {
    if (!imagePath) return 'https://via.placeholder.com/400x200';
    if (imagePath.startsWith('/static/')) {
      return API_BASE_URL + imagePath;
    }
    return imagePath;
  }

  useEffect(() => {
    let mounted = true;
    getChefs()
      .then((all) => {
        if (!mounted) return;
        const found = all.find((c) => c.id === dish.chef_id) || null;
        setChef(found);
      })
      .catch((e) => console.error('[DishDetail] getChefs error', e))
      .finally(() => {
        if (mounted) setLoadingChef(false);
      });
    return () => {
      mounted = false;
    };
  }, [dish.chef_id]);

  const increment = () => setQuantity((q) => q + 1);
  const decrement = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        style={styles.container}
      >
        {/* --- Full-width Dish Image --- */}
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: getImageUrl(dish.image) }} // ← prefix handled here
            style={styles.dishImage}
          />
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* --- Chef Row --- */}
          {!loadingChef && chef ? (
            <TouchableOpacity
              style={styles.chefRow}
              onPress={() => navigation.navigate('Profile', { chefId: chef.id })}
            >
              <View style={styles.chefAvatarPlaceholder}>
                <Ionicons name="person-circle-outline" size={40} color={Colors.primary} />
              </View>
              <Text style={styles.chefName}>{chef.name}</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.textMuted}
                style={{ marginLeft: 'auto' }}
              />
            </TouchableOpacity>
          ) : (
            <View style={[styles.chefRow, { opacity: 0.5 }]}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={[styles.chefName, { marginLeft: 8 }]}>Loading chef…</Text>
            </View>
          )}

          {/* --- Dish Title & Kind Badge --- */}
          <View style={styles.titleRow}>
            <Text style={styles.dishTitle}>{dish.name}</Text>
            {dish.is_kind && (
              <View style={styles.kindBadge}>
                <Text style={styles.kindBadgeText}>Kind Meal</Text>
              </View>
            )}
          </View>

          {/* --- PRICE (only if not is_kind) --- */}
          {!dish.is_kind && (
            <Text style={styles.priceText}>${dish.price.toFixed(2)}</Text>
          )}

          {/* --- Prep Time & Availability --- */}
          <View style={styles.metaRow}>
            {dish.prep_time != null && (
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={18} color={Colors.accent} />
                <Text style={styles.metaText}>{dish.prep_time} min</Text>
              </View>
            )}
            <View style={styles.metaItem}>
              <Ionicons
                name="cube-outline"
                size={18}
                color={dish.pickup_available ? Colors.primary : Colors.textMuted}
              />
              <Text
                style={[
                  styles.metaText,
                  { color: dish.pickup_available ? Colors.primary : Colors.textMuted },
                ]}
              >
                Pickup
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons
                name="bicycle-outline"
                size={18}
                color={dish.delivery_available ? Colors.primary : Colors.textMuted}
              />
              <Text
                style={[
                  styles.metaText,
                  { color: dish.delivery_available ? Colors.primary : Colors.textMuted },
                ]}
              >
                Delivery
              </Text>
            </View>
          </View>

          {/* --- Divider --- */}
          <View style={styles.divider} />

          {/* --- Description Section --- */}
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>
            {dish.description || 'No description provided.'}
          </Text>

          {/* --- Spacer at bottom --- */}
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>

      {/* --- Sticky Footer: Quantity + Add to Cart --- */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 8 }]}>
        <View style={styles.quantitySelector}>
          <TouchableOpacity onPress={decrement} style={styles.qtyButton}>
            <Ionicons name="remove" size={20} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{quantity}</Text>
          <TouchableOpacity onPress={increment} style={styles.qtyButton}>
            <Ionicons name="add" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.addToCartBtn}
          onPress={() => {
            addItem({
              id: dish.id.toString(),
              name: dish.name,
              chef: chef?.name || `Chef ${dish.chef_id}`,
              price: dish.price,
              quantity,
            });
          }}
        >
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  imageWrapper: {
    width: '100%',
    height: 240,
    backgroundColor: '#eee',
  },
  dishImage: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    padding: 4,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginTop: -16,
  },
  chefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  chefAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  chefName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  dishTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    flex: 1,
  },
  kindBadge: {
    backgroundColor: '#2ecc71',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  kindBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  priceText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.accent,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    height: 60,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 12,
  },
  qtyButton: {
    padding: 4,
  },
  qtyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginHorizontal: 8,
    minWidth: 24,
    textAlign: 'center',
  },
  addToCartBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
