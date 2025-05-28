// mobile/src/screens/AccountScreen.tsx
import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getChefs, Chef } from '../api/chefs';
import { API_BASE_URL } from '../api/config';
import { getAuthHeaders } from '../api/authHeaders';
import FilterMenu, { FilterOption } from '../components/FilterMenu';
import { RootStackParamList } from '../../App';
import { Colors } from '../theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const L1: FilterOption[] = [
  { key: 'top',      label: 'Top Mates' },
  { key: 'verified', label: 'Verified Mates' },
  { key: 'kind',     label: 'Kind Bites' },
  { key: 'ready',    label: 'Ready-to-go' },
];

const AVATAR = 80;

export default function AccountScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { token, logout } = useContext(AuthContext);
  const { items: cartItems } = useCart();

  const [isFeeder, setIsFeeder] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [chefs, setChefs] = useState<Chef[]>([]);
  const [firstFilter, setFirstFilter] = useState<string>('top');

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_BASE_URL}/users/me`, { headers });
        if (!res.ok) throw new Error(`Profile load failed (${res.status})`);
        setUser(await res.json());
      } catch (e: any) {
        Alert.alert('Error', e.message);
      }
    })();
  }, [token]);

  useEffect(() => {
    let m = true;
    getChefs().then(data => m && setChefs(data)).catch(console.error);
    return () => { m = false; };
  }, []);

  if (!user) return <Text style={styles.loader}>Loading profile…</Text>;

  const favChefs = chefs.filter(c => user.favorites.includes(c.id));

  return (
    <View style={styles.container}>
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleBtn, !isFeeder && styles.toggleActive]}
          onPress={() => setIsFeeder(false)}
        >
          <Text style={[styles.toggleTxt, !isFeeder && styles.toggleTxtActive]}>
            Eater
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, isFeeder && styles.toggleActive]}
          onPress={() => setIsFeeder(true)}
        >
          <Text style={[styles.toggleTxt, isFeeder && styles.toggleTxtActive]}>
            Feeder
          </Text>
        </TouchableOpacity>
      </View>

      {!isFeeder && (
        <>
          <View style={styles.profile}>
            {user.profile_picture ? (
              <Image source={{ uri: user.profile_picture }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="person" size={40} color={Colors.textMuted} />
              </View>
            )}
            <View style={styles.info}>
              <Text style={styles.name}>{user.first_name} {user.last_name}</Text>
              <Text style={styles.username}>@{user.username}</Text>
              <Text style={styles.email}>{user.email}</Text>
            </View>
            <TouchableOpacity style={styles.editBtn} onPress={() => Alert.alert('Edit', 'Coming soon')}>
              <Text style={styles.editTxt}>Edit</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Favorite Chefs</Text>
          <FilterMenu options={L1} selectedKey={firstFilter} onSelect={setFirstFilter} />

          <FlatList
            contentContainerStyle={styles.favList}
            data={favChefs.filter(c => (
              firstFilter === 'ready'
                ? (user.favorites?.length ?? 0) > 0
                : true
            ))}
            keyExtractor={c => c.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.favCard}
                onPress={() => navigation.navigate('Profile', { chefId: item.id })}
              >
                <Text style={styles.favTxt}>{item.name}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={styles.sectionEmpty}>No favorites.</Text>}
          />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cart</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
              <Text style={styles.linkTxt}>View Cart ({cartItems.length})</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order History</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Orders')}>
              <Text style={styles.linkTxt}>View Orders</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Information</Text>
            <TouchableOpacity onPress={() => Alert.alert('Payment', 'Coming soon')}>
              <Text style={styles.linkTxt}>Manage Payment Methods</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutTxt}>Log Out</Text>
          </TouchableOpacity>
        </>
      )}

      {isFeeder && (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderTxt}>Feeder dashboard coming soon!</Text>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutTxt}>Log Out</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const toggleH = 40;
const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: Colors.background },
  toggleContainer: {
    flexDirection: 'row',
    marginTop: Platform.OS === 'ios' ? 60 : 40,
    marginHorizontal: 16,
    height: toggleH,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: toggleH / 2,
    overflow: 'hidden',
  },
  toggleBtn:       { flex: 1, alignItems: 'center', justifyContent: 'center' },
  toggleActive:    { backgroundColor: Colors.primary },
  toggleTxt:       { fontSize: 16, color: Colors.primary },
  toggleTxtActive: { color: '#fff' },
  loader:          { textAlign: 'center', marginTop: 20, color: Colors.textMuted },
  profile:         { flexDirection: 'row', alignItems: 'center', margin: 16 },
  avatar: {
    width: AVATAR, height: AVATAR,
    borderRadius: AVATAR/2,
    backgroundColor: '#fff',
  },
  avatarPlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#ddd' },
  info:            { flex: 1, marginLeft: 12 },
  name:            { fontSize: 20, fontWeight: '600', color: Colors.text },
  username:        { fontSize: 16, color: Colors.textMuted, marginTop: 4 },
  email:           { fontSize: 14, color: Colors.textMuted, marginTop: 2 },
  editBtn:         {
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: Colors.primary,
    borderRadius: 4,
  },
  editTxt:         { color: Colors.primary, fontSize: 14 },
  sectionTitle:    { fontSize: 18, fontWeight: '600', marginHorizontal: 16, marginTop: 24, color: Colors.text },
  favList:         { paddingLeft: 16, paddingVertical: 8 },
  favCard:         {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    marginRight: 8,
  },
  favTxt:          { fontSize: 16, color: Colors.primary },
  sectionEmpty:    { fontSize: 14, color: Colors.textMuted, marginHorizontal: 16 },
  linkTxt:         { fontSize: 16, color: Colors.primary, marginHorizontal: 16, marginVertical: 8 },
  section:         { marginTop: 16 },
  logoutBtn:       {
    margin: 16,
    padding: 12,
    backgroundColor: Colors.danger,
    borderRadius: 4,
    alignItems: 'center',
  },
  logoutTxt:       { color: '#fff', fontSize: 16 },
  placeholder:     { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderTxt:  { fontSize: 16, color: Colors.textMuted },
});
