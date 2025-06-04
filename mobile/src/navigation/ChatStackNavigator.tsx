// mobile/src/navigation/ChatStackNavigator.tsx

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ChatListScreen from '../screens/ChatListScreen';

type ChatStackParamList = {
  Chat: undefined;
};

const Stack = createNativeStackNavigator<ChatStackParamList>();

export default function ChatStackNavigator() {
  return (
    <Stack.Navigator initialRouteName="Chat" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Chat" component={ChatListScreen} />
    </Stack.Navigator>
  );
}
