import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../context/AuthContext';
import { Colors } from '../theme';
import suburbsWithCoordinates from '../data/suburbsWithCoordinates.json';

const API_BASE_URL = 'http://10.0.2.2:8000';
const SCREEN_HEIGHT = Dimensions.get('window').height;

type Coordinates = { latitude: number; longitude: number } | null;

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
  const [pickupLocation, setPickupLocation] = useState('');
  const [pickupCoordinates, setPickupCoordinates] = useState<Coordinates>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSuburbs, setFilteredSuburbs] = useState(suburbsWithCoordinates);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    console.log('[AddMealScreen] Component mounted');
    return () => console.log('[AddMealScreen] Component unmounted');
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length < 3) {
      setFilteredSuburbs([]);
    } else {
      const matches = suburbsWithCoordinates.filter((suburb) =>
        suburb.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSuburbs(matches);
      console.log('[AddMealScreen] Filtered suburbs:', matches.length);
    }
  }, [searchQuery]);

  const handleSuburbSelect = (suburb: { name: string; coordinates: { latitude: number; longitude: number } }) => {
    setSearchQuery(suburb.name);
    setFilteredSuburbs([]);
    setPickupLocation(suburb.name);
    setPickupCoordinates(suburb.coordinates);
    setIsFocused(false);
    console.log('[AddMealScreen] Selected suburb:', suburb.name);
  };

  const pickImage = async (fromCamera = false) => {
    try {
      const result = fromCamera
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
      if (!result.canceled && result.assets?.length) {
        console.log('[AddMealScreen] Image selected:', result.assets[0].uri);
        setImage(result.assets[0].uri);
      }
    } catch (e: any) {
      console.error('[AddMealScreen] pickImage error:', e);
      Alert.alert('Error', 'Could not pick image.');
    }
  };

  const onSave = async () => {
    if (!name || !description || (!isKind && !price)) {
      return Alert.alert('Error', 'Name, description, and price are required.');
    }
    if (!pickupLocation) {
      return Alert.alert('Error', 'Suburb is required.');
    }
    if (!pickupCoordinates) {
      return Alert.alert('Error', 'Coordinates for the suburb could not be determined.');
    }
    if (!token) {
      return Alert.alert('Error', 'You must be logged in to add a meal.');
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
      formData.append('pickup_location', pickupLocation);
      formData.append('pickup_coordinates', JSON.stringify(pickupCoordinates));

      if (image) {
        formData.append('image', { uri: image, name: 'meal.jpg', type: 'image/jpeg' } as any);
      }

      const res = await fetch(`${API_BASE_URL}/users/me/dishes`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) {
        const text = await res.text();
        console.error('[AddMealScreen] Server response:', text);
        throw new Error(text || 'Failed to add meal');
      }
      console.log('[AddMealScreen] Received successful response');
      await refreshUser();
      navigation.navigate('MyMealsList');
    } catch (e: any) {
      console.error('[AddMealScreen] onSave error:', e);
      Alert.alert('Error', e.message || 'Could not add meal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
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

        <TextInput style={styles.input} placeholder="Meal Name" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Description" value={description} onChangeText={setDescription} />
        <TextInput
          style={styles.input}
          placeholder="Price (AUD)"
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
          editable={!isKind}
        />

        <View style={styles.row}>
          <Text style={styles.label}>Kind Meal?</Text>
          <TouchableOpacity onPress={() => setIsKind(!isKind)} style={styles.checkBox(isKind)}>
            <Text style={styles.label}>{isKind ? '✓' : ''}</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Prep Time (min)"
          keyboardType="numeric"
          value={prepTime}
          onChangeText={setPrepTime}
        />

        <View style={styles.row}>
          <Text style={styles.label}>Pickup?</Text>
          <TouchableOpacity onPress={() => setPickupAvailable(!pickupAvailable)} style={styles.checkBox(pickupAvailable)}>
            <Text style={styles.label}>{pickupAvailable ? '✓' : ''}</Text>
          </TouchableOpacity>
          <Text style={[styles.label, { marginLeft: 20 }]}>Delivery?</Text>
          <TouchableOpacity onPress={() => setDeliveryAvailable(!deliveryAvailable)} style={styles.checkBox(deliveryAvailable)}>
            <Text style={styles.label}>{deliveryAvailable ? '✓' : ''}</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { marginTop: 12 }]}>Suburb</Text>
        <View style={styles.placesWrapper}>
          <View style={styles.placesInputContainer}>
            <TextInput
              style={styles.placesTextInput}
              placeholder="Type Melbourne suburb"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => {
                setIsFocused(true);
                console.log('[AddMealScreen] Suburb TextInput focused');
              }}
              onBlur={() => {
                setIsFocused(false);
                console.log('[AddMealScreen] Suburb TextInput blurred');
              }}
              multiline={false}
              numberOfLines={1}
            />
          </View>
          {(isFocused || searchQuery) && filteredSuburbs.length > 0 && (
            <FlatList
              data={filteredSuburbs}
              keyExtractor={(item) => item.name}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.suburbItem}
                  onPress={() => handleSuburbSelect(item)}
                >
                  <Text style={styles.suburbText}>{item.name}</Text>
                </TouchableOpacity>
              )}
              style={styles.placesListView}
              nestedScrollEnabled={true}
            />
          )}
        </View>
        

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={onSave} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Save Meal'}</Text>
          </TouchableOpacity>
          {loading && <ActivityIndicator style={{ marginTop: 10 }} />}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.background,
    paddingBottom: 80, // Extra padding to account for fixed button
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 24,
    textAlign: 'center',
  },
  image: { width: 180, height: 120, borderRadius: 12, alignSelf: 'center', marginBottom: 12 },
  imgPlaceholder: {
    width: 180,
    height: 120,
    backgroundColor: '#eee',
    alignSelf: 'center',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
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
  placesWrapper: { height: 44, position: 'relative', marginBottom: 20 },
  placesInputContainer: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#fff',
    height: 44,
  },
  placesTextInput: { height: 44, paddingHorizontal: 12, fontSize: 14, color: Colors.text },
  placesListView: {
    position: 'absolute',
    top: 46,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    backgroundColor: '#fff',
    maxHeight: SCREEN_HEIGHT * 0.3,
    zIndex: 10,
  },
  suburbItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suburbText: {
    fontSize: 14,
    color: Colors.text,
  },
  chosenLocationText: { fontSize: 14, color: Colors.textMuted, marginBottom: 16 },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  button: { backgroundColor: Colors.primary, padding: 14, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});