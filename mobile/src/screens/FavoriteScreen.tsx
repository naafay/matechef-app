// mobile/src/screens/FavoritesScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../api/config';
import { getAuthHeaders } from '../api/authHeaders';
import { getChefs, Chef, getChefDishes } from '../api/chefs';
import { Dish } from '../api/dishes';
import { RootStackParamList } from '../../App';
import { Colors } from '../theme';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Favorites'>;

export default function FavoritesScreen() {
  const navigation = useNavigation<NavProp>();
  const [chefs, setChefs]           = useState<Chef[]>([]);
  const [dishCounts, setDishCounts] = useState<Record<number, Dish[]>>({});
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  useEffect(() => {
    let m = true;
    (async () => {
      try {
        const headers = await getAuthHeaders();
        const meRes = await fetch(`${API_BASE_URL}/users/me`, { headers });
        if (!meRes.ok) throw new Error('Failed to load favorites');
        const me = await meRes.json();
        const favIds: number[] = me.favorites;

        const all = await getChefs();
        const favChefs = all.filter(c => favIds.includes(c.id));
        if (!m) return;
        setChefs(favChefs);

        const counts: Record<number, Dish[]> = {};
        await Promise.all(favChefs.map(async c => {
          counts[c.id] = await getChefDishes(c.id);
        }));
        if (m) setDishCounts(counts);
      } catch (e: any) {
        console.error('[Favorites]', e);
        if (m) setError(e.message);
      } finally {
        if (m) setLoading(false);
      }
    })();
    return () => { m = false; };
  }, []);

  if (loading) {
    return <ActivityIndicator style={styles.center} size="large" />;
  }
  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  }

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={chefs}
      keyExtractor={c => c.id.toString()}
      renderItem={({ item: chef }) => {
        const ds = dishCounts[chef.id] || [];
        const ready = ds.filter(d => d.name.toLowerCase().includes('grilled')).length;
        const bio = chef.bio || '';
        const words = bio.split(/\s+/);
        const shortBio = words.length > 25 ? words.slice(0,25).join(' ') + '…' : bio;

        return (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Profile', { chefId: chef.id })}
          >
            {chef.profile_picture ? (
              <Image source={{ uri: chef.profile_picture }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color={Colors.textMuted} />
              </View>
            )}
            <View style={styles.info}>
              <Text style={styles.name}>{chef.name}</Text>
              <View style={styles.statsRow}>
                <Text style={styles.stat}>{ds.length} Dishes</Text>
                <Text style={styles.stat}>{ready} Ready</Text>
              </View>
              {shortBio ? <Text style={styles.desc}>{shortBio}</Text> : null}
            </View>
          </TouchableOpacity>
        );
      }}
      ListEmptyComponent={<Text style={styles.empty}>No favorites yet.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  list:               { padding: 16, backgroundColor: Colors.background },
  center:             { flex:1, justifyContent:'center' },
  error:              { textAlign:'center', marginTop:40, color:Colors.danger },
  card:               {
    flexDirection:'row',
    backgroundColor:'#fff',
    borderRadius:8,
    padding:12,
    marginBottom:12,
    elevation:2,
  },
  avatar:             { width:60, height:60, borderRadius:30, marginRight:12 },
  avatarPlaceholder:  {
    width:60, height:60, borderRadius:30,
    backgroundColor:'#ddd', marginRight:12,
    alignItems:'center', justifyContent:'center'
  },
  info:               { flex:1 },
  name:               { fontSize:18, fontWeight:'600', color:Colors.primary },
  statsRow:           { flexDirection:'row', marginTop:4 },
  stat:               { marginRight:16, color:Colors.textMuted },
  desc:               { marginTop:6, color:Colors.textMuted, fontSize:14 },
  empty:              { textAlign:'center', marginTop:40, color:Colors.textMuted },
});
