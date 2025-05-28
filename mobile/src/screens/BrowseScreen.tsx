// mobile/src/screens/BrowseScreen.tsx
// BrowseScreen: fetches and displays the list of chefs from your backend

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { getChefs, Chef } from '../api/chefs';

type Props = NativeStackScreenProps<RootStackParamList, 'Browse'>;

export default function BrowseScreen({ navigation }: Props) {
  const [chefs, setChefs] = useState<Chef[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchChefs() {
      console.log('[BrowseScreen] fetching chefs...');
      try {
        if (isMounted) {
          setLoading(true);
          setError(null);
        }
        const data = await getChefs();
        console.log('[BrowseScreen] fetched chefs:', data);
        if (isMounted) {
          setChefs(data);
        }
      } catch (e: any) {
        console.error('[BrowseScreen] fetch error:', e);
        if (isMounted) {
          setError(e.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchChefs();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Browse by Chef</Text>

      {loading && <ActivityIndicator style={styles.loader} size="large" />}

      {!loading && error && (
        <Text style={styles.error}>Error: {error}</Text>
      )}

      {!loading && !error && chefs.length === 0 && (
        <Text style={styles.empty}>No chefs found.</Text>
      )}

      {!loading && !error && chefs.length > 0 && (
        <FlatList
          data={chefs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() =>
                navigation.navigate('Profile', { chefId: item.id })
              }
            >
              <Text style={styles.itemText}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      )}
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
    marginBottom: 16,
  },
  loader: {
    marginTop: 20,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  empty: {
    textAlign: 'center',
    marginTop: 20,
    color: '#555',
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  itemText: {
    fontSize: 18,
  },
});
