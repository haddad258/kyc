// src/navigation/KycNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen    from '../screens/kyc/DashboardScreen';
import PersonalInfoScreen from '../screens/kyc/PersonalInfoScreen';
import IdCaptureScreen    from '../screens/kyc/IdCaptureScreen';
import FaceVerifyScreen   from '../screens/kyc/FaceVerifyScreen';
import LivenessScreen     from '../screens/kyc/LivenessScreen';
import ResultScreen       from '../screens/result/ResultScreen';

const Stack = createNativeStackNavigator();

export default function KycNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#060E1A' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Dashboard"    component={DashboardScreen} />
      <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
      <Stack.Screen name="IdCapture"    component={IdCaptureScreen} />
      <Stack.Screen name="FaceVerify"   component={FaceVerifyScreen} />
      <Stack.Screen name="Liveness"     component={LivenessScreen} />
      <Stack.Screen name="Result"       component={ResultScreen} />
    </Stack.Navigator>
  );
}
