import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme';

interface HeaderProps {
  currentTab: string | null;
  currentStack: string | null;
}

export default function Header({ currentTab, currentStack }: HeaderProps) {
  const navigation = useNavigation<any>();

  console.log('[Header] currentTab:', currentTab, 'currentStack:', currentStack);

  function handleAccountPress() {
    console.log('[Header] Account icon pressed');
    console.log('[Header] Navigating to Account at root level');
    try {
      navigation.navigate('Account');
    } catch (err: any) {
      console.error('[Header] Navigation error while going to Account:', err);
      Alert.alert('Navigation Error', err.message || 'Unexpected error');
    }
  }

  function handleCartPress() {
    console.log('[Header] Cart icon pressed');
    console.log('[Header] Navigating to Cart at root level');
    try {
      navigation.navigate('Cart');
    } catch (err: any) {
      console.error('[Header] Navigation error while going to Cart:', err);
      Alert.alert('Navigation Error', err.message || 'Unexpected error');
    }
  }

  function handleNotificationsPress() {
    console.log('[Header] Notifications icon pressed');
    console.log('[Header] Navigating to Notifications at root level');
    try {
      navigation.navigate('Notifications');
    } catch (err: any) {
      console.error('[Header] Navigation error while going to Notifications:', err);
      Alert.alert('Navigation Error', err.message || 'Unexpected error');
    }
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity onPress={handleAccountPress}>
          <Ionicons name="person-circle-outline" size={28} color={Colors.primary} />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/mc_logo_header.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.rightIcons}>
          <TouchableOpacity onPress={handleCartPress} style={styles.iconButton}>
            <Ionicons name="cart-outline" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNotificationsPress} style={styles.iconButton}>
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
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: Colors.background,
    position: 'relative',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.textMuted,
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
    width: 150,
    height: 40,
  },
  rightIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 16,
  },
});
