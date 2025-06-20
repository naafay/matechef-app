import React, { useState, useContext, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
  FlatList,
  Dimensions,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  NavigationProp,
  ParamListBase,
} from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { Colors } from '../theme';
import * as ImagePicker from 'expo-image-picker';
import suburbsWithCoordinates from '../data/suburbsWithCoordinates.json';

const API_BASE_URL = 'http://10.0.2.2:8000';
const SCREEN_HEIGHT = Dimensions.get('window').height;

type Coordinates = { latitude: number; longitude: number } | null;

function getImageUrl(imagePath?: string | null): string | null {
  if (!imagePath) return null;
  if (imagePath.startsWith('file:') || imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('/static/')) return API_BASE_URL + imagePath;
  return imagePath;
}

export default function EditMealScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const route = useRoute<any>();
  const { user, token, refreshUser } = useContext(AuthContext);
  const meal = route.params?.meal;

  const [name, setName] = useState(meal?.name || '');
  const [description, setDescription] = useState(meal?.description || '');
  const [price, setPrice] = useState(meal?.price ? String(meal.price) : '');
  const [image, setImage] = useState<string | null>(meal?.image || null);
  const [isKind, setIsKind] = useState(meal?.is_kind || false);
  const [prepTime, setPrepTime] = useState(meal?.prep_time ? String(meal.prep_time) : '');
  const [pickupAvailable, setPickupAvailable] = useState(meal?.pickup_available ?? true);
  const [deliveryAvailable, setDeliveryAvailable] = useState(meal?.delivery_available ?? false);
  const [pickupLocation, setPickupLocation] = useState(meal?.pickup_location || '');
  const [pickupCoordinates, setPickupCoordinates] = useState<Coordinates>(meal?.pickup_coordinates && typeof meal.pickup_coordinates === 'string' ? JSON.parse(meal.pickup_coordinates) : null);
  const [searchQuery, setSearchQuery] = useState(meal?.pickup_location || '');
  const [filteredSuburbs, setFilteredSuburbs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showFlatList, setShowFlatList] = useState(false);
  const isInitialMount = useRef(true);

  useEffect(() => {
    console.log('[EditMealScreen] Mounted. Full navigation state:');
    console.log(JSON.stringify(navigation.getState(), null, 2));
    setIsFocused(false); // Ensure no initial focus
    setFilteredSuburbs([]); // Clear filteredSuburbs on mount
    isInitialMount.current = false; // Mark initial mount as complete

    const tabNav = navigation.getParent();
    if (tabNav) {
      console.log('[EditMealScreen] Parent (Tab) routeNames:', JSON.stringify(tabNav.getState().routeNames));
    } else {
      console.warn('[EditMealScreen] Could not find parent Tab navigator.');
    }
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      setFilteredSuburbs([]); // Ensure no filtering on initial mount
      return;
    }
    if (searchQuery.trim().length < 3) {
      setFilteredSuburbs([]);
    } else {
      const matches = suburbsWithCoordinates.filter((suburb) =>
        suburb.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSuburbs(matches);
      console.log('[EditMealScreen] Filtered suburbs:', matches.length);
    }
  }, [searchQuery]);

  const handleSuburbSelect = (suburb: { name: string; coordinates: { latitude: number; longitude: number } }) => {
    setSearchQuery(suburb.name);
    setFilteredSuburbs([]);
    setPickupLocation(suburb.name);
    setPickupCoordinates(suburb.coordinates);
    setIsFocused(false);
    setShowFlatList(false); // Collapse FlatList after selection
    console.log('[EditMealScreen] Selected suburb:', suburb.name);
  };

  const handleFocus = () => {
    setIsFocused(true);
    setShowFlatList(true); // Show FlatList only when focused
    console.log('[EditMealScreen] Suburb TextInput focused');
  };

  const handleBlur = () => {
    setIsFocused(false);
    console.log('[EditMealScreen] Suburb TextInput blurred');
  };

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
    if (!pickupLocation) {
      Alert.alert('Error', 'Suburb is required.');
      return;
    }
    if (!pickupCoordinates) {
      Alert.alert('Error', 'Coordinates for the suburb could not be determined.');
      return;
    }
    if (!token) {
      Alert.alert('Error', 'You must be logged in to edit a meal.');
      return;
    }
    setLoading(true);

    try {
      console.log('[EditMealScreen] Sending PATCH to /dishes/', meal.id);
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

      if (image && image !== meal?.image && image.startsWith('file:')) {
        formData.append('image', {
          uri: image,
          name: 'meal.jpg',
          type: 'image/jpeg',
        });
      }

      const res = await fetch(`${API_BASE_URL}/dishes/${meal.id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error('[EditMealScreen] Server response:', errorText);
        throw new Error(`Failed to update meal: ${errorText}`);
      }
      console.log('[EditMealScreen] Successful PATCH response');
      await refreshUser();
      const tabNav = navigation.getParent();
      console.log('[EditMealScreen] Before navigation. Tab state:', JSON.stringify(tabNav?.getState(), null, 2));
      if (!tabNav) {
        console.error('[EditMealScreen] Could not find Tab navigator');
        navigation.navigate('MyMealsList');
      } else {
        console.log('[EditMealScreen] Resetting to MyMeals tab, MyMealsList screen');
        tabNav.reset({
          index: 0,
          routes: [{ name: 'MyMeals', params: { screen: 'MyMealsList' } }],
        });
      }
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
            console.log('[EditMealScreen] Sending DELETE to /dishes/', meal.id);
            const resp = await fetch(`${API_BASE_URL}/dishes/${meal.id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!resp.ok) {
              const errorText = await res.text();
              throw new Error(`Failed to delete: ${errorText}`);
            }
            console.log('[EditMealScreen] Successful DELETE response');
            await refreshUser();
            Alert.alert('Success', 'Meal deleted successfully!');
            const tabNav = navigation.getParent();
            console.log('[EditMealScreen] Before navigation (delete). Tab state:', JSON.stringify(tabNav?.getState(), null, 2));
            if (!tabNav) {
              console.error('[EditMealScreen] Could not find Tab navigator');
              navigation.navigate('MyMealsList');
            } else {
              console.log('[EditMealScreen] Resetting to MyMeals tab, MyMealsList screen after delete');
              tabNav.reset({
                index: 0,
                routes: [{ name: 'MyMeals', params: { screen: 'MyMealsList' } }],
              });
            }
          } catch (e: any) {
            Alert.alert('Error', e.message);
            console.error('[EditMealScreen] onDelete error:', e);
          }
          setLoading(false);
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: React.ReactNode }) => (
    <View style={styles.inputContainer}>{item}</View>
  );

  const data = [
    <Text style={styles.title}>Edit Meal</Text>,
    <TouchableOpacity onPress={() => pickImage(false)}>
      {getImageUrl(image) ? (
        <Image source={{ uri: getImageUrl(image) as string }} style={styles.image} />
      ) : (
        <View style={styles.imgPlaceholder}>
          <Text style={styles.imgText}>Upload Image</Text>
        </View>
      )}
    </TouchableOpacity>,
    <View style={styles.btnRow}>
      <TouchableOpacity style={styles.camBtn} onPress={() => pickImage(true)}>
        <Text style={styles.camTxt}>Take Photo</Text>
      </TouchableOpacity>
    </View>,
    <TextInput style={styles.input} placeholder="Meal Name" value={name} onChangeText={setName} />,
    <TextInput style={styles.input} placeholder="Description" value={description} onChangeText={setDescription} />,
    <TextInput
      style={styles.input}
      placeholder="Price (AUD)"
      keyboardType="numeric"
      value={price}
      onChangeText={setPrice}
      editable={!isKind}
    />,
    <View style={styles.row}>
      <Text style={styles.label}>Kind Meal (Free)?</Text>
      <TouchableOpacity onPress={() => setIsKind(!isKind)} style={styles.checkBox(isKind)}>
        <Text style={styles.label}>{isKind ? '✓' : ''}</Text>
      </TouchableOpacity>
    </View>,
    <TextInput
      style={styles.input}
      placeholder="Prep Time (minutes)"
      keyboardType="numeric"
      value={prepTime}
      onChangeText={setPrepTime}
    />,
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
    </View>,
    <Text style={[styles.label, { marginTop: 12 }]}>Suburb</Text>,
    <View style={styles.placesWrapper}>
      <View style={styles.placesInputContainer}>
        <TextInput
          style={styles.placesTextInput}
          placeholder="Type Melbourne suburb"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={handleFocus}
          onBlur={handleBlur}
          multiline={false}
          numberOfLines={1}
          autoFocus={false} // Prevent auto-focus on mount
        />
      </View>
      {showFlatList && filteredSuburbs.length > 0 && (
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
    </View>,
    <TouchableOpacity style={styles.button} onPress={onSave} disabled={loading}>
      <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Save Meal'}</Text>
    </TouchableOpacity>,
    <TouchableOpacity style={styles.delBtn} onPress={onDelete} disabled={loading}>
      <Text style={styles.delBtnText}>Delete Meal</Text>
    </TouchableOpacity>,
    loading && <ActivityIndicator style={{ marginTop: 10 }} />,
  ].filter(Boolean);

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item, index) => index.toString()}
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: Colors.background,
    paddingBottom: 20,
  },
  inputContainer: {
    marginBottom: 12,
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
  button: {
    backgroundColor: Colors.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  delBtn: {
    backgroundColor: Colors.danger,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  delBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});