// CartScreen.tsx
// Lists items in the cart with remove buttons and a checkout footer

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCart } from '../context/CartContext';
import { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Cart'>;

export default function CartScreen({ navigation }: Props) {
  const { items, removeItem, clearCart } = useCart();

  // Calculate total
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Cart</Text>

      {items.length === 0 ? (
        <Text style={styles.empty}>Your cart is empty.</Text>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.item}>
                <View style={styles.info}>
                  <Text style={styles.name}>
                    {item.name} x{item.quantity}
                  </Text>
                  <Text style={styles.sub}>
                    Chef: {item.chef}
                  </Text>
                  <Text style={styles.sub}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.remove}
                  onPress={() => removeItem(item.id)}
                >
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              </View>
            )}
          />

          {/* Footer with total and checkout */}
          <View style={styles.footer}>
            <Text style={styles.total}>Total: ${total.toFixed(2)}</Text>
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={() => {
                // TODO: integrate real checkout flow
                clearCart();
                navigation.goBack();
              }}
            >
              <Text style={styles.checkoutText}>Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 48,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  empty: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 32,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  info: { flex: 1 },
  name: { fontSize: 18, fontWeight: '500' },
  sub: { fontSize: 14, color: '#555' },
  remove: {
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  removeText: { color: '#d00' },

  footer: {
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingVertical: 16,
    alignItems: 'center',
  },
  total: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  checkoutButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  checkoutText: { color: '#fff', fontSize: 16 },
});
