import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";

import DashboardPetOwner from "../screens/PetOwner/Dashboard";
import Pets from "../screens/PetOwner/Pets";
import ScanQr from "../screens/PetOwner/ScanQr";
import Search from "../screens/PetOwner/Search";
import Profile from "../screens/PetOwner/Profile";

const Tab = createBottomTabNavigator();

export default function PetOwnerTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#8EB4D0",
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardPetOwner}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Pets"
        component={Pets}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="heart" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Scan QR"
        component={ScanQr}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="camera" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Search"
        component={Search}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="search" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}