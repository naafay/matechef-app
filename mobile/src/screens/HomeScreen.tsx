// mobile/src/screens/HomeScreen.tsx

import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'AuthStack'>; // Not actually used if you don’t navigate from here directly

export default function HomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to MateChef</Text>
      <Text style={styles.subtitle}>
        Browse by Chef or search for dishes on the map
      </Text>
      <Button
        title="Browse by Chef"
        onPress={() => navigation.navigate('Favorites')} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,              
    alignItems: 'center', 
    justifyContent: 'center',
    padding: 16,           
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
