import React, { useEffect, useContext } from 'react';
import { ImageBackground, StyleSheet, View, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';

export default function AuthLoadingScreen() {
  const navigation = useNavigation();
  const { setToken } = useContext(AuthContext);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('userToken');
        if (storedToken) {
          setToken(storedToken);
          navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
        } else {
          navigation.reset({ index: 0, routes: [{ name: 'AuthStack' }] });
        }
      } catch (e) {
        navigation.reset({ index: 0, routes: [{ name: 'AuthStack' }] });
      }
    };

    bootstrap();
  }, []);

  return (
    <ImageBackground
      source={require('../../assets/mc_bg.jpg')}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
