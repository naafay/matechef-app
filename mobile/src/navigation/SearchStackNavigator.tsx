// mobile/src/navigation/SearchStackNavigator.tsx

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SearchScreen from '../screens/SearchScreen';
import ChefProfileScreen from '../screens/ChefProfileScreen';
import DishDetailScreen from '../screens/DishDetailScreen';

type SearchStackParamList = {
  Search: undefined;
  Profile: { chefId: number };
  DishDetail: { dish: any };
};

const Stack = createNativeStackNavigator<SearchStackParamList>();

export default function SearchStackNavigator() {
  return (
    <Stack.Navigator initialRouteName="Search" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Profile" component={ChefProfileScreen} />
      <Stack.Screen name="DishDetail" component={DishDetailScreen} />
    </Stack.Navigator>
  );
}
