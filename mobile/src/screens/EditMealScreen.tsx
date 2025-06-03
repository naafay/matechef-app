// mobile/src/screens/EditMealScreen.tsx

import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { Colors } from '../theme';
import * as ImagePicker from 'expo-image-picker';

const API_BASE_URL = 'http://10.0.2.2:8000';

function getImageUrl(imagePath?: string | null): string | null {
  if (!imagePath) return null;
  if (imagePath.startsWith('file:') || imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('/static/')) return API_BASE_URL + imagePath;
  return imagePath;
}

export default function EditMealScreen() {
  const navigation = useNavigation<any>();
  const route      = useRoute<any>();
  const { user, token, refreshUser } = useContext(AuthContext);
  const meal       = route.params?.meal;

  const [name, setName]                         = useState(meal?.name || '');
  const [description, setDescription]           = useState(meal?.description || '');
  const [price, setPrice]                       = useState(meal?.price ? String(meal.price) : '');
  const [image, setImage]                       = useState<string | null>(meal?.image || null);
  const [isKind, setIsKind]                     = useState(meal?.is_kind || false);
  const [prepTime, setPrepTime]                 = useState(meal?.prep_time ? String(meal.prep_time) : '');
  const [pickupAvailable, setPickupAvailable]   = useState(meal?.pickup_available ?? true);
  const [deliveryAvailable, setDeliveryAvailable] = useState(meal?.delivery_available ?? false);
  const [loading, setLoading]                   = useState(false);

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
        console.log('[EditMealScreen] Image selected:', result.assets[0].uri);
        setImage(result.assets[0].uri);
      }
    } catch (e: any) {
      Alert.alert('Error', 'Could not pick image.');
      console.error('[EditMealScreen] pickImage error:', e);
    }
  };

  const onSave = async () => {
    if (!name || !description || (!isKind && !price)) {
      Alert.alert('Error', 'Name, description, and price are required.');
      return;
    }
    setLoading(true);
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

      // Only upload if it's a new local file
      if (image && image !== meal?.image && image.startsWith('file:')) {
        // @ts-ignore
        formData.append('image', {
          uri: image,
          name: 'meal.jpg',
          type: 'image/jpeg',
        });
      }

      const res = await fetch(`${API_BASE_URL}/dishes/${meal.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to update meal.');
      await refreshUser?.();

      // After saving, reset into Feeder → MyMeals (use "Feeder", not "FeederTab")
      navigation.reset({
        index: 0,
        routes: [{ name: 'Feeder', params: { screen: 'MyMeals' } }],
      });
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not update meal');
      console.error('[EditMealScreen] onSave error:', e);
    }
    setLoading(false);
  };

  const onDelete = async () => {
    Alert.alert('Delete?', 'Are you sure you want to delete this meal?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            const resp = await fetch(`${API_BASE_URL}/dishes/${meal.id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!resp.ok) throw new Error('Failed to delete meal');
            await refreshUser?.();

            // After deletion, also reset into Feeder → MyMeals
            navigation.reset({
              index: 0,
              routes: [{ name: 'Feeder', params: { screen: 'MyMeals' } }],
            });
          } catch (e: any) {
            Alert.alert('Error', e.message);
            console.error('[EditMealScreen] onDelete error:', e);
          }
          setLoading(false);
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Edit Meal</Text>

      <TouchableOpacity onPress={() => pickImage(false)}>
        {getImageUrl(image) ? (
          <Image source={{ uri: getImageUrl(image) as string }} style={styles.image} />
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

      <TouchableOpacity style={styles.delBtn} onPress={onDelete} disabled={loading}>
        <Text style={styles.delBtnText}>Delete Meal</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator style={{ marginTop: 10 }} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: Colors.background,
    minHeight: 600,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 24,
    textAlign: 'center',
  },
  image: {
    width: 180,
    height: 120,
    alignSelf: 'center',
    borderRadius: 12,
    marginBottom: 12,
  },
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
  imgText: {
    color: Colors.textMuted,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  camBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  camTxt: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
    color: Colors.text,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    color: Colors.primary,
    marginRight: 8,
  },
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
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  delBtn: {
    marginTop: 12,
    backgroundColor: Colors.danger,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  delBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
