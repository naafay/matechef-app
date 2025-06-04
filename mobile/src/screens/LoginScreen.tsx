// mobile/src/screens/LoginScreen.tsx

import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { Colors } from '../theme';

type LoginNavProp = NativeStackNavigationProp<RootStackParamList, 'AuthStack'>;

export default function LoginScreen() {
  const { login } = useContext(AuthContext);
  const navigation = useNavigation<LoginNavProp>();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter both username (or email) and password.');
      return;
    }
    try {
      await login(username, password);
    } catch {
      // login() already shows an alert on failure
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/mc_logo_header.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>MateChef Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Username or Email"
        placeholderTextColor="#b5cdb5"
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#b5cdb5"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={onSubmit}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.link}>New user? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logo: {
    width: 180,
    height: 80,
    marginBottom: 18,
    marginTop: -40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
    color: '#fff',
    backgroundColor: '#1e3d2a',
  },
  button: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 4,
    marginBottom: 12,
    width: '100%',
  },
  buttonText: {
    color: Colors.primary,
    textAlign: 'center',
    fontWeight: '600',
  },
  link: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 8,
  },
});
