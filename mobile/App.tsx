// App.tsx
// Root app with a Bottom Tab Navigator (icons only, no labels) for MateChef

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import your screens
import MapScreen from './src/screens/MapScreen';
import FavoriteScreen from './src/screens/FavoriteScreen';
import SearchScreen from './src/screens/SearchScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import AccountScreen from './src/screens/AccountScreen';

// Create the bottom tab navigator
const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Map"
        screenOptions={({ route }) => ({
          headerShown: false,           // hide header for all tabs
          tabBarShowLabel: false,       // hide labels beneath icons
          tabBarActiveTintColor: '#4CAF50', // Aussie green
          tabBarInactiveTintColor: 'gray',  // inactive icon color
          tabBarIcon: ({ color, size }) => {
            // Choose an icon based on the route name
            let iconName: React.ComponentProps<typeof Ionicons>['name'] = 'ellipse';

            switch (route.name) {
              case 'Map':
                iconName = 'map-outline';
                break;
              case 'Favorite':
                iconName = 'heart-outline';
                break;
              case 'Search':
                iconName = 'search-outline';
                break;
              case 'Orders':
                iconName = 'list-outline';
                break;
              case 'Account':
                iconName = 'person-outline';
                break;
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Map" component={MapScreen} />
        <Tab.Screen name="Favorite" component={FavoriteScreen} />
        <Tab.Screen name="Search" component={SearchScreen} />
        <Tab.Screen name="Orders" component={OrdersScreen} />
        <Tab.Screen name="Account" component={AccountScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
