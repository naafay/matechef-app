// OrdersScreen.tsx
// Shows past & current orders

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function OrdersScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Orders</Text>
      {/* TODO: fetch and display user orders */}
      <Text style={styles.placeholder}>You have no orders yet.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 48,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  placeholder: {
    color: '#888',
  },
});

