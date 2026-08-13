import React from 'react';
import { View, Text, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import DashboardStaff from './DashboardStaff';
import DateStaff from './DateStaff';
import ReceiptStaff from './ReceiptStaff';
import ProfileStaff from './ProfileStaff';

const Tab = createBottomTabNavigator();

export default function StaffNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: '#2F80ED',
                tabBarInactiveTintColor: '#90A4AE',
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderTopWidth: 1,
                    borderTopColor: '#EAEAEC',
                    height: Platform.OS === 'ios' ? 85 : 65,
                    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
                    paddingTop: 10,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: 'bold',
                    marginTop: 4,
                },
                tabBarIcon: ({ color }) => {
                    if (route.name === 'Dashboard') {
                        return <Feather name="home" size={24} color={color} />;
                    } else if (route.name === 'Date') {
                        return <Feather name="calendar" size={24} color={color} />;
                    } else if (route.name === 'Receipt') {
                        return <Feather name="dollar-sign" size={24} color={color} />;
                    } else if (route.name === 'Profile') {
                        return <Feather name="user" size={24} color={color} />;
                    }
                },
            })}
        >
            <Tab.Screen name="Dashboard" component={DashboardStaff} />
            <Tab.Screen name="Date" component={DateStaff} />
            <Tab.Screen name="Receipt" component={ReceiptStaff} />
            <Tab.Screen name="Profile" component={ProfileStaff} />
        </Tab.Navigator>
    );
}