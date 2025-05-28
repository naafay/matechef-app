// HomeScreen.tsx
// Landing page for MateChef with navigation to the Browse screen

import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
// Helper types for navigation props
import { NativeStackScreenProps } from '@react-navigation/native-stack';
// Import the route definitions
import { RootStackParamList } from '../../App';

// Props type for this screen: navigation & route
type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      {/* Main title */}
      <Text style={styles.title}>Welcome to MateChef</Text>
      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Browse by Chef or search for dishes on the map
      </Text>
      {/* Button to go to Browse */}
      <Button
        title="Browse by Chef"
        onPress={() => navigation.navigate('Browse')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,               // fill the screen
    alignItems: 'center',  // center horizontally
    justifyContent: 'center', // center vertically
    padding: 16,           // add some padding
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#555',
  },
});
