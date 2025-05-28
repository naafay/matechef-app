// MapScreen.tsx
// Home tab: shows the Plates Nearby map

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Plates Nearby</Text>
      {/* TODO: integrate react-native-maps here */}
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>[ Map will appear here ]</Text>
      </View>
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
    flex: 1,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#888',
  },
});
