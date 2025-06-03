import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

// --- MapTab screens ---
import MapScreen from '../screens/MapScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DishDetailScreen from '../screens/DishDetailScreen';
import CartScreen from '../screens/CartScreen';

// --- AccountTab screens ---
import AccountScreen from '../screens/AccountScreen';
import MyMealsScreen from '../screens/MyMealsScreen';
import AddMealScreen from '../screens/AddMealScreen';
import EditMealScreen from '../screens/EditMealScreen';

// --- Other tabs ---
import FavoriteScreen from '../screens/FavoriteScreen';
import SearchScreen from '../screens/SearchScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ChatListScreen from '../screens/ChatListScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MapStackNavigator() {
  return (
    <Stack.Navigator initialRouteName="Map">
      <Stack.Screen
        name="Map"
        component={MapScreen}
        options={{ headerTitle: 'Map' }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerTitle: 'Profile' }}
      />
      <Stack.Screen
        name="DishDetail"
        component={DishDetailScreen}
        options={{ headerTitle: 'Dish Detail' }}
      />
      <Stack.Screen
        name="Cart"
        component={CartScreen}
        options={{ headerTitle: 'Cart' }}
      />
    </Stack.Navigator>
  );
}

function AccountStackNavigator() {
  return (
    <Stack.Navigator initialRouteName="Account">
      <Stack.Screen
        name="Account"
        component={AccountScreen}
        options={{ headerTitle: 'Account' }}
      />
      <Stack.Screen
        name="MyMeals"
        component={MyMealsScreen}
        options={{ headerTitle: 'My Meals' }}
      />
      <Stack.Screen
        name="AddMeal"
        component={AddMealScreen}
        options={{ headerTitle: 'Add Meal' }}
      />
      <Stack.Screen
        name="EditMeal"
        component={EditMealScreen}
        options={{ headerTitle: 'Edit Meal' }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator initialRouteName="MapTab">
        <Tab.Screen
          name="MapTab"
          component={MapStackNavigator}
          options={{ tabBarLabel: 'Map' }}
        />
        <Tab.Screen
          name="FavoriteTab"
          component={FavoriteScreen}
          options={{ tabBarLabel: 'Favorites' }}
        />
        <Tab.Screen
          name="SearchTab"
          component={SearchScreen}
          options={{ tabBarLabel: 'Search' }}
        />
        <Tab.Screen
          name="OrdersTab"
          component={OrdersScreen}
          options={{ tabBarLabel: 'Orders' }}
        />
        <Tab.Screen
          name="ChatTab"
          component={ChatListScreen}
          options={{ tabBarLabel: 'Chat' }}
        />
        <Tab.Screen
          name="AccountTab"
          component={AccountStackNavigator}
          options={{ tabBarLabel: 'Account' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
