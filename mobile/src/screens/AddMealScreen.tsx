// mobile/src/screens/AddMealScreen.tsx

import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../context/AuthContext';
import { Colors } from '../theme';

const API_BASE_URL = 'http://10.0.2.2:8000';

type MyMealsStackParamList = {
  MyMealsList: undefined;
  AddMeal: undefined;
  EditMeal: { meal: any };
};

type AddMealNavProp = NativeStackNavigationProp<MyMealsStackParamList, 'AddMeal'>;

export default function AddMealScreen() {
  const navigation = useNavigation<AddMealNavProp>();
  const { token, user, refreshUser } = useContext(AuthContext);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isKind, setIsKind] = useState(false);
  const [prepTime, setPrepTime] = useState('');
  const [pickupAvailable, setPickupAvailable] = useState(true);
  const [deliveryAvailable, setDeliveryAvailable] = useState(false);
  const [loading, setLoading] = useState(false);

  const pickImage = async (fromCamera = false) => {
    try {
      let result;
      if (fromCamera) {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.7,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.7,
        });
      }
      if (!result.canceled && result.assets?.length) {
        console.log('[AddMealScreen] Image selected:', result.assets[0].uri);
        setImage(result.assets[0].uri);
      }
    } catch (e: any) {
      Alert.alert('Error', 'Could not pick image.');
      console.error('[AddMealScreen] pickImage error:', e);
    }
  };

  const onSave = async () => {
    if (!name || !description || (!isKind && !price)) {
      Alert.alert('Error', 'Name, description, and price are required.');
      return;
    }
    if (!token) {
      Alert.alert('Error', 'You must be logged in to add a meal.');
      return;
    }
    setLoading(true);
    console.log('[AddMealScreen] Sending request to add meal');
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', isKind ? '0' : price);
      formData.append('chef_id', user?.chef_id?.toString() || '');
      formData.append('is_kind', isKind ? 'true' : 'false');
      formData.append('prep_time', prepTime);
      formData.append('pickup_available', pickupAvailable ? 'true' : 'false');
      formData.append('delivery_available', deliveryAvailable ? 'true' : 'false');

      if (image) {
        formData.append('image', {
          uri: image,
          name: 'meal.jpg',
          type: 'image/jpeg',
        } as any);
      }

      const res = await fetch(`${API_BASE_URL}/users/me/dishes`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('[AddMealScreen] Server response:', errorText);
        throw new Error(`Failed to add meal: ${errorText}`);
      }

      console.log('[AddMealScreen] Received successful response');
      await refreshUser();

      // Pop back to MyMealsList inside the inner MyMeals stack:
      navigation.navigate('MyMealsList');
    } catch (e: any) {
      console.error('[AddMealScreen] Error adding meal:', e);
      Alert.alert('Error', e.message || 'Could not add meal');
    }
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add Meal</Text>
      <TouchableOpacity onPress={() => pickImage(false)}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <View style={styles.imgPlaceholder}>
            <Text style={styles.imgText}>Upload Image</Text>
          </View>
        )}
      </TouchableOpacity>
      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.camBtn} onPress={() => pickImage(true)}>
          <Text style={styles.camTxt}>Take Photo</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Meal Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        style={styles.input}
        placeholder="Price (AUD)"
        keyboardType="numeric"
        value={price}
        onChangeText={setPrice}
        editable={!isKind}
      />
      <View style={styles.row}>
        <Text style={styles.label}>Kind Meal (Free)?</Text>
        <TouchableOpacity onPress={() => setIsKind(!isKind)} style={styles.checkBox(isKind)}>
          <Text style={styles.label}>{isKind ? '✓' : ''}</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Prep Time (minutes)"
        keyboardType="numeric"
        value={prepTime}
        onChangeText={setPrepTime}
      />
      <View style={styles.row}>
        <Text style={styles.label}>Pickup Available?</Text>
        <TouchableOpacity
          onPress={() => setPickupAvailable(!pickupAvailable)}
          style={styles.checkBox(pickupAvailable)}
        >
          <Text style={styles.label}>{pickupAvailable ? '✓' : ''}</Text>
        </TouchableOpacity>
        <Text style={[styles.label, { marginLeft: 20 }]}>Delivery Available?</Text>
        <TouchableOpacity
          onPress={() => setDeliveryAvailable(!deliveryAvailable)}
          style={styles.checkBox(deliveryAvailable)}
        >
          <Text style={styles.label}>{deliveryAvailable ? '✓' : ''}</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.button} onPress={onSave} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Save Meal'}</Text>
      </TouchableOpacity>
      {loading && <ActivityIndicator style={{ marginTop: 10 }} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: Colors.background },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 24,
    textAlign: 'center',
  },
  image: { width: 180, height: 120, alignSelf: 'center', borderRadius: 12, marginBottom: 12 },
  imgPlaceholder: {
    width: 180,
    height: 120,
    backgroundColor: '#eee',
    alignSelf: 'center',
    borderRadius: 12,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imgText: { color: Colors.textMuted },
  btnRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 10 },
  camBtn: { backgroundColor: Colors.primary, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7 },
  camTxt: { color: '#fff' },
  input: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
    color: Colors.text,
  },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  label: { fontSize: 16, color: Colors.primary, marginRight: 8 },
  checkBox: (checked: boolean) => ({
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: checked ? Colors.primary : '#fff',
    marginRight: 5,
  }),
  button: {
    marginTop: 24,
    backgroundColor: Colors.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});
