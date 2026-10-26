import React from "react";
import { StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import DashboardPetOwner from "../screens/PetOwner/Dashboard";
import Pets from "../screens/PetOwner/Pets";
import ScanQr from "../screens/PetOwner/ScanQr";
import ClinicScreen from "../screens/PetOwner/ClinicScreen";
import Profile from "../screens/PetOwner/Profile";

const Tab = createBottomTabNavigator();

export default function PetOwnerTabs({ setIsLoggedIn }) {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2C4A6F",
        tabBarInactiveTintColor: "#94A3B8",
        tabBarStyle: [
          styles.tabBar,
          {
            height: 56 + insets.bottom,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 6,
          },
        ],
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardPetOwner}
        options={{
          tabBarLabel: "หน้าแรก",
          tabBarIcon: ({ color }) => (
            <Feather name="home" size={22} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="MyPets"
        component={Pets}
        options={{
          tabBarLabel: "สัตว์เลี้ยง",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="paw" size={23} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Scan QR"
        component={ScanQr}
        options={{
          tabBarLabel: "สแกน QR",
          tabBarIcon: ({ color }) => (
            <Feather name="camera" size={22} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Clinic"
        component={ClinicScreen}
        options={{
          tabBarLabel: "คลินิก",
          tabBarIcon: ({ color }) => (
            <Feather name="plus-square" size={22} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        options={{
          tabBarLabel: "โปรไฟล์",
          tabBarIcon: ({ color }) => (
            <Feather name="user" size={22} color={color} />
          ),
        }}
      >
        {(props) => (
          <Profile {...props} setIsLoggedIn={setIsLoggedIn} />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2EBF2",
    paddingTop: 6,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  tabBarItem: {
    paddingVertical: 2,
  },
});