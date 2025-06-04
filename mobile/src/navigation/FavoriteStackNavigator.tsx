// mobile/src/navigation/FavoriteStackNavigator.tsx

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import FavoriteScreen from '../screens/FavoriteScreen';
import ChefProfileScreen from '../screens/ChefProfileScreen';
import DishDetailScreen from '../screens/DishDetailScreen';

type FavoriteStackParamList = {
  FavoritesList: undefined;
  Profile: { chefId: number };
  DishDetail: { dish: any };
};

const Stack = createNativeStackNavigator<FavoriteStackParamList>();

export default function FavoriteStackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="FavoritesList"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="FavoritesList" component={FavoriteScreen} />
      <Stack.Screen name="Profile" component={ChefProfileScreen} />
      <Stack.Screen name="DishDetail" component={DishDetailScreen} />
    </Stack.Navigator>
  );
}
