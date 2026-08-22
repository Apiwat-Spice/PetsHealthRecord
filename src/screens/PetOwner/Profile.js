import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { Alert } from "react-native";




export default function Profile({ setIsLoggedIn  }) {
  const handleLogout = () => {
    Alert.alert(
      "ออกจากระบบ",
      "คุณต้องการออกจากระบบหรือไม่?",
      [
        {
          text: "ยกเลิก",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await SecureStore.deleteItemAsync("token");
              await SecureStore.deleteItemAsync("user");
              await SecureStore.deleteItemAsync("pet_owners");

              // เปลี่ยนสถานะ Login
              setIsLoggedIn(false);

            } catch (error) {
              console.error("Logout Error:", error);

              Alert.alert(
                "เกิดข้อผิดพลาด",
                "ไม่สามารถออกจากระบบได้"
              );
            }
          },
        },
      ]
    );
  };
  return (
    <ScrollView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👤</Text>
        </View>

        <Text style={styles.name}>John Doe</Text>
        <Text style={styles.email}>john@example.com</Text>

        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Personal Information */}
      <Text style={styles.sectionTitle}>Personal Information</Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>First Name</Text>
          <Text style={styles.value}>John</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Last Name</Text>
          <Text style={styles.value}>Doe</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>john@example.com</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Phone</Text>
          <Text style={styles.value}>081-234-5678</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Address</Text>
          <Text style={styles.value}>Nakhon Pathom, Thailand</Text>
        </View>
      </View>

      {/* Account */}
      <Text style={styles.sectionTitle}>Account</Text>

      <TouchableOpacity style={styles.menuCard}>
        <Text style={styles.menuText}>Change Password</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuCard}>
        <Text style={styles.menuText}>Notification Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuCard}>
        <Text style={styles.menuText}>Privacy Policy</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    paddingHorizontal: 20,
  },

  header: {
    alignItems: "center",
    marginTop: 50,
    marginBottom: 25,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#DCEBFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },

  avatarText: {
    fontSize: 55,
  },

  name: {
    fontSize: 26,
    fontWeight: "bold",
  },

  email: {
    color: "#666",
    marginTop: 5,
    marginBottom: 15,
  },

  editButton: {
    backgroundColor: "#4F8EF7",
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 10,
  },

  editButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 18,
    marginBottom: 25,
    elevation: 2,
  },

  row: {
    marginBottom: 15,
  },

  label: {
    color: "#888",
    fontSize: 14,
  },

  value: {
    fontSize: 17,
    fontWeight: "600",
    marginTop: 3,
  },

  menuCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
    elevation: 2,
  },

  menuText: {
    fontSize: 16,
    fontWeight: "500",
  },

  logoutButton: {
    backgroundColor: "#EF4444",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },

  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});