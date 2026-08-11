// src/navigation/RootNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { selectIsAuth } from '../store/authSlice';
import AuthNavigator from './AuthNavigator';
import KycNavigator from './KycNavigator';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const isAuthenticated = useSelector(selectIsAuth);
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      {isAuthenticated ? (
        <Stack.Screen name="KycRoot" component={KycNavigator} />
      ) : (
        <Stack.Screen name="AuthRoot" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}
