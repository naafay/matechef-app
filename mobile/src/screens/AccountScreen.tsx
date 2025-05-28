// mobile/src/screens/AccountScreen.tsx
// — Eater/Feeder toggle, profile (with email), favorites, cart, orders, logout
// — Uses getChefs from ../api and manual fetch of /users/me with getAuthHeaders

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
import { RootStackParamList } from '../../App';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AVATAR_SIZE = 80;

export default function AccountScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { token, logout } = useContext(AuthContext);
  const { items: cartItems } = useCart();

  const [isFeeder, setIsFeeder] = useState(false);
  const [user, setUser] = useState<{
    first_name: string;
    last_name:  string;
    username:   string;
    email:      string;
    profile_picture?: string | null;
    favorites: number[];
  } | null>(null);
  const [chefs, setChefs] = useState<Chef[]>([]);

  // Load profile from /users/me
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_BASE_URL}/users/me`, { headers });
        if (!res.ok) throw new Error(`Profile load failed (${res.status})`);
        const data = await res.json();
        setUser(data);
      } catch (e: any) {
        console.error('[AccountScreen] users/me error', e);
        Alert.alert('Error', e.message);
      }
    })();
  }, [token]);

  // Load chefs for favorite lookup
  useEffect(() => {
    let mounted = true;
    getChefs()
      .then(data => { if (mounted) setChefs(data); })
      .catch(e => console.error('[AccountScreen] getChefs error', e));
    return () => { mounted = false; };
  }, []);

  if (!user) {
    return <Text style={styles.loader}>Loading profile…</Text>;
  }

  const favChefs = chefs.filter(c => user.favorites.includes(c.id));

  // Feeder dashboard placeholder
  if (isFeeder) {
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
        <View style={styles.placeholder}>
          <Text style={styles.placeholderTxt}>Feeder dashboard coming soon!</Text>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutTxt}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Eater view
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

      <FlatList
        ListHeaderComponent={
          <>
            {/* Profile header */}
            <View style={styles.profile}>
              {user.profile_picture ? (
                <Image
                  source={{ uri: user.profile_picture }}
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Ionicons name="person" size={40} color="#888" />
                </View>
              )}
              <View style={styles.info}>
                <Text style={styles.name}>
                  {user.first_name} {user.last_name}
                </Text>
                <Text style={styles.username}>@{user.username}</Text>
                <Text style={styles.email}>{user.email}</Text>
              </View>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => Alert.alert('Edit Profile', 'Coming soon')}
              >
                <Text style={styles.editTxt}>Edit</Text>
              </TouchableOpacity>
            </View>

            {/* Favorite Chefs */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Favorite Chefs</Text>
              {favChefs.length > 0 ? (
                <FlatList
                  horizontal
                  data={favChefs}
                  keyExtractor={c => c.id.toString()}
                  showsHorizontalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.favCard}
                      onPress={() =>
                        navigation.navigate('Profile', { chefId: item.id })
                      }
                    >
                      <Text style={styles.favTxt}>{item.name}</Text>
                    </TouchableOpacity>
                  )}
                />
              ) : (
                <Text style={styles.sectionEmpty}>No favorites yet.</Text>
              )}
            </View>

            {/* Cart link */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cart</Text>
              <TouchableOpacity
                style={styles.linkBtn}
                onPress={() => navigation.navigate('Cart')}
              >
                <Text style={styles.linkTxt}>View Cart ({cartItems.length})</Text>
              </TouchableOpacity>
            </View>

            {/* Orders link */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Order History</Text>
              <TouchableOpacity
                style={styles.linkBtn}
                onPress={() => navigation.navigate('Orders')}
              >
                <Text style={styles.linkTxt}>View Orders</Text>
              </TouchableOpacity>
            </View>

            {/* Payment info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Payment Information</Text>
              <TouchableOpacity
                style={styles.linkBtn}
                onPress={() => Alert.alert('Payment', 'Coming soon')}
              >
                <Text style={styles.linkTxt}>Manage Payment Methods</Text>
              </TouchableOpacity>
            </View>

            {/* Log out */}
            <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
              <Text style={styles.logoutTxt}>Log Out</Text>
            </TouchableOpacity>
          </>
        }
        data={[]}
        renderItem={null}
        keyExtractor={() => 'dummy'}
      />
    </View>
  );
}

const toggleH = 40;
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  toggleContainer: {
    flexDirection: 'row',
    marginTop: Platform.OS === 'ios' ? 60 : 40,
    marginHorizontal: 16,
    height: toggleH,
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: toggleH / 2,
    overflow: 'hidden',
  },
  toggleBtn: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  toggleActive: { backgroundColor: '#4CAF50' },
  toggleTxt: { fontSize: 16, color: '#4CAF50' },
  toggleTxtActive: { color: '#fff' },
  loader: { textAlign: 'center', marginTop: 20, color: '#555' },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: '#eee',
  },
  avatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 20, fontWeight: '600' },
  username: { fontSize: 16, color: '#777', marginTop: 4 },
  email: { fontSize: 14, color: '#777', marginTop: 2 },
  editBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 4,
  },
  editTxt: { color: '#4CAF50', fontSize: 14 },
  section: { marginTop: 24, marginHorizontal: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  sectionEmpty: { fontSize: 14, color: '#777' },
  favCard: {
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    marginRight: 8,
  },
  favTxt: { fontSize: 16 },
  linkBtn: { paddingVertical: 8 },
  linkTxt: { fontSize: 16, color: '#4CAF50' },
  logoutBtn: {
    margin: 16,
    padding: 12,
    backgroundColor: '#d00',
    borderRadius: 4,
    alignItems: 'center',
  },
  logoutTxt: { color: '#fff', fontSize: 16 },
});
