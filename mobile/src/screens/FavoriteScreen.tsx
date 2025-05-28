// FavoriteScreen.tsx
// Shows the user’s bookmarked/favorited chefs

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function FavoriteScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Favorites</Text>
      {/* TODO: fetch and list favorited chefs here */}
      <Text style={styles.placeholder}>No favorites yet.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 48,
    alignItems: 'center',
    backgroundColor: '#fff',
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
