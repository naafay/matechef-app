// SearchScreen.tsx
// Advanced browse/search tab with filters

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SearchScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Browse & Search</Text>
      {/* TODO: integrate FilterMenu and list results */}
      <Text style={styles.placeholder}>Filter options go here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 48,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  placeholder: {
    color: '#888',
    marginHorizontal: 16,
  },
});
