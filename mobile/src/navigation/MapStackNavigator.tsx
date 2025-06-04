// mobile/src/navigation/MapStackNavigator.tsx

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MapScreen from '../screens/MapScreen';
import ChefProfileScreen from '../screens/ChefProfileScreen';
import DishDetailScreen from '../screens/DishDetailScreen';
import CartScreen from '../screens/CartScreen';

type MapStackParamList = {
  MapList: undefined;
  Profile: { chefId: number };
  DishDetail: { dish: any };
  Cart: undefined;
};

const Stack = createNativeStackNavigator<MapStackParamList>();

export default function MapStackNavigator() {
  return (
    <Stack.Navigator initialRouteName="MapList" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MapList" component={MapScreen} />
      <Stack.Screen name="Profile" component={ChefProfileScreen} />
      <Stack.Screen name="DishDetail" component={DishDetailScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
    </Stack.Navigator>
  );
}
