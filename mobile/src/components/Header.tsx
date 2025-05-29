// mobile/src/components/Header.tsx

import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
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

  function handleAccountPress() {
    if (currentStack === 'Account') {
      // Determine root screen for current tab
      let rootScreen = '';
      switch (currentTab) {
        case 'MapTab':
          rootScreen = 'Map';
          break;
        case 'FavoriteTab':
          rootScreen = 'Favorite';
          break;
        case 'SearchTab':
          rootScreen = 'Search';
          break;
        case 'OrdersTab':
          rootScreen = 'Orders';
          break;
        case 'ChatTab':
          rootScreen = 'Chat';
          break;
        default:
          rootScreen = 'Map';
      }
      navigation.reset({
        index: 0,
        routes: [{ name: rootScreen }],
      });
    } else {
      navigation.navigate('Account');
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
          <TouchableOpacity
            onPress={() => navigation.navigate('Cart')}
            style={styles.iconButton}
          >
            <Ionicons name="cart-outline" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Notifications')}
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
