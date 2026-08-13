import React from 'react';
import { View, Text, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import DashboardClinic from './DashboardClinic';
import TeamClinic from './TeamClinic';
import DateClinic from './DateClinic';
import ProfileClinic from './ProfileClinic';

const DummyScreen = ({ route }) => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFA' }}>
        <Text style={{ fontSize: 18, color: '#9C27B0', fontWeight: 'bold' }}>กำลังสร้างหน้า {route.name}...</Text>
    </View>
);

const Tab = createBottomTabNavigator();

export default function ClinicNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: '#9C27B0',
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
                    fontWeight: '600',
                    marginTop: 4,
                },
                tabBarIcon: ({ color }) => {
                    // Icon ตาม Tab
                    if (route.name === 'Dashboard') {
                        return <Feather name="home" size={24} color={color} />;
                    } else if (route.name === 'Team') {
                        return <Feather name="users" size={24} color={color} />;
                    } else if (route.name === 'Date') {
                        return <Feather name="calendar" size={24} color={color} />;
                    } else if (route.name === 'Clinic') {
                        return <MaterialCommunityIcons name="domain" size={24} color={color} />;
                    }
                },
            })}
        >
            <Tab.Screen name="Dashboard" component={DashboardClinic} />
            <Tab.Screen name="Team" component={TeamClinic} />
            <Tab.Screen name="Date" component={DateClinic} />
            <Tab.Screen name="Clinic" component={ProfileClinic} />
        </Tab.Navigator>
    );
}