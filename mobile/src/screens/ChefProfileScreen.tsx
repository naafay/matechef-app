// ChefProfileScreen.tsx
// Displays details for a single chef (fetch from backend later)

import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

// Props type for this screen’s navigation & route
type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export default function ChefProfileScreen({ route, navigation }: Props) {
  const { chefId } = route.params;

  // TODO: replace this with a fetch call to retrieve the chef’s real data
  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.title}>Chef Profile</Text>

      {/* Show the passed-in chefId */}
      <Text style={styles.subtitle}>Chef ID: {chefId}</Text>

      {/* Back button */}
      <Button title="Back to Browse" onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,                  // fill screen
    alignItems: 'center',     // center horizontally
    justifyContent: 'center', // center vertically
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 24,
    color: '#555',
  },
});
