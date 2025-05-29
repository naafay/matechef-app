// App.tsx
import React, { useContext } from 'react';
import { View, ImageBackground, StyleSheet } from 'react-native';
import { NavigationContainer }                   from '@react-navigation/native';
import { createNativeStackNavigator }            from '@react-navigation/native-stack';
import { createBottomTabNavigator }              from '@react-navigation/bottom-tabs';
import { Ionicons }                              from '@expo/vector-icons';

import { AuthProvider, AuthContext }             from './src/context/AuthContext';
import { CartProvider }                          from './src/context/CartContext';
import { Colors }                                from './src/theme';
import Header                                    from './src/components/Header';

// Screens
import MapScreen         from './src/screens/MapScreen';
import FavoriteScreen    from './src/screens/FavoriteScreen';
import SearchScreen      from './src/screens/SearchScreen';
import OrdersScreen      from './src/screens/OrdersScreen';
import ChatListScreen    from './src/screens/ChatListScreen';
import AccountScreen     from './src/screens/AccountScreen';
import ChefProfileScreen from './src/screens/ChefProfileScreen';
import CartScreen        from './src/screens/CartScreen';
import DishDetailScreen  from './src/screens/DishDetailScreen';
import LoginScreen       from './src/screens/LoginScreen';
import SignupScreen      from './src/screens/SignupScreen';

export type RootStackParamList = {
  Main: undefined;
  Account: undefined;
  Profile: { chefId: number };
  Cart: undefined;
  DishDetail: { dish: import('./src/api/dishes').Dish };
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab       = createBottomTabNavigator();
const AuthStack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Map"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#264D3D',
        tabBarInactiveTintColor: '#777777',
        tabBarStyle: { backgroundColor: Colors.background },
        tabBarIcon: ({ color, size }) => {
          let iconName: React.ComponentProps<typeof Ionicons>['name'] = 'ellipse';
          switch (route.name) {
            case 'Map':
              iconName = color === '#264D3D' ? 'location'      : 'location-outline';
              break;
            case 'Favorite':
              iconName = color === '#264D3D' ? 'heart'         : 'heart-outline';
              break;
            case 'Search':
              iconName = color === '#264D3D' ? 'search'        : 'search-outline';
              break;
            case 'Orders':
              iconName = color === '#264D3D' ? 'list'          : 'list-outline';
              break;
            case 'Chat':
              iconName = color === '#264D3D' ? 'chatbubble'    : 'chatbubble-outline';
              break;
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Map"      component={MapScreen} />
      <Tab.Screen name="Favorite" component={FavoriteScreen} />
      <Tab.Screen name="Search"   component={SearchScreen} />
      <Tab.Screen name="Orders"   component={OrdersScreen} />
      <Tab.Screen name="Chat"     component={ChatListScreen} />
    </Tab.Navigator>
  );
}

function AuthFlow() {
  console.log('🔑 AuthFlow mounted – showing login/signup');
  return (
    <ImageBackground
      source={require('./assets/mc_bg.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <Header />
      <AuthStack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
        }}
      >
        <AuthStack.Screen name="Login"  component={LoginScreen}  />
        <AuthStack.Screen name="Signup" component={SignupScreen} />
      </AuthStack.Navigator>
    </ImageBackground>
  );
}

function RootNavigator() {
  const { token } = useContext(AuthContext);
  console.log('🛰️  RootNavigator token?', token);
  return token ? (
    <View style={{ flex: 1 }}>
      <Header />
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Main"      component={MainTabs}           />
        <RootStack.Screen name="Account"   component={AccountScreen}      />
        <RootStack.Screen name="Profile"   component={ChefProfileScreen}  />
        <RootStack.Screen name="Cart"      component={CartScreen}         />
        <RootStack.Screen name="DishDetail"component={DishDetailScreen}  />
      </RootStack.Navigator>
    </View>
  ) : (
    <AuthFlow />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </CartProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
});
