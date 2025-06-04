import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MyMealsScreen from '../screens/MyMealsScreen';
import AddMealScreen from '../screens/AddMealScreen';
import EditMealScreen from '../screens/EditMealScreen';
import FeederOnboardingScreen from '../screens/FeederOnboardingScreen';

type MyMealsStackParamList = {
  ChefSetup: undefined;
  MyMealsList: undefined;
  AddMeal: undefined;
  EditMeal: { meal: any };
};

const Stack = createNativeStackNavigator<MyMealsStackParamList>();

export default function MyMealsStackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="MyMealsList"
      screenOptions={{ headerShown: false }}
    >
      {/* If user hasn’t finished setting up, they see ChefSetup */}
      <Stack.Screen name="ChefSetup" component={FeederOnboardingScreen} />

      {/* Renamed from “MyMeals” → “MyMealsList” */}
      <Stack.Screen name="MyMealsList" component={MyMealsScreen} />

      <Stack.Screen name="AddMeal" component={AddMealScreen} />
      <Stack.Screen name="EditMeal" component={EditMealScreen} />
    </Stack.Navigator>
  );
}
