import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import DashboardVet from './DashboardVet';
import ScanQRcode from './ScanQRcode';
import ProfileVET from './ProfileVET';
import PetScaned from './PetScaned';

const SearchPlaceholder = () => (
  <View style={styles.dummyContainer}>
    <Text style={styles.dummyText}>หน้า ค้นหา</Text>
  </View>
);

const Tab = createBottomTabNavigator();

export default function VetNavigator({setIsLoggedIn}) {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#00B862',
        tabBarInactiveTintColor: '#888888',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#EAEAEC',
          height: 65,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      {/* แดชบอร์ด */}
      <Tab.Screen
        name="Dashboard"
        component={DashboardVet}
        options={{
          tabBarLabel: 'แดชบอร์ด',
          tabBarIcon: ({ color }) => (
            <Feather name="home" size={24} color={color} />
          ),
        }}
      />

      {/* สแกน QR */}
      <Tab.Screen
        name="ScanQR"
        component={ScanQRcode}
        options={{
          tabBarLabel: 'สแกน QR',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="qrcode-scan" size={24} color={color} />
          ),
        }}
      />

      {/* ค้นหา */}
      <Tab.Screen
        name="PetScaned"
        component={PetScaned}
        options={{
          tabBarLabel: 'Pets',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="paw" size={26} color={color} />
          ),
        }}
      />

      {/* โปรไฟล์ */}
      <Tab.Screen
        name="Profile"
        options={{
          tabBarLabel: 'โปรไฟล์',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="stethoscope" size={26} color={color} />
          ),
        }}
      >
        {(props) => <ProfileVET {...props} setIsLoggedIn={setIsLoggedIn} />}
      </Tab.Screen>

    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  dummyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  dummyText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: 'bold',
  },
});