// mobile/src/components/Header.tsx

import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme';

export default function Header() {
  const navigation = useNavigation();

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.container}>
        {/* Left: User avatar */}
        <TouchableOpacity onPress={() => navigation.navigate('Account' as any)}>
          <Ionicons name="person-circle-outline" size={28} color={Colors.primary} />
        </TouchableOpacity>

        {/* Center (absolute overlay): Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/mc_logo_header.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Right: Cart + Notifications */}
        <View style={styles.rightIcons}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Cart' as any)}
            style={styles.iconButton}
          >
            <Ionicons name="cart-outline" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Notifications' as any)}
            style={styles.iconButton}
          >
            <Ionicons name="notifications-outline" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Colors.background,
  },
  container: {
    height: 60,                     // fixed header height
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: Colors.background,
    position: 'relative',           // for the logo overlay
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.textMuted, // thin bottom border
  },
  logoContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 150,   // 120 × 1.25
    height: 40,   // 32 × 1.25
  },
  rightIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 16,
  },
});
