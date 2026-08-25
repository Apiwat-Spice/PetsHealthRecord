import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ImageBackground,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { Feather } from '@expo/vector-icons';
import { API_URL } from '../../config';

export default function Register({ navigation }) {
  const [role, setRole] = useState("petowner"); // 'petowner' หรือ 'vet'
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [phone_number, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // State สำหรับ Checkbox
  const [agree, setAgree] = useState(false);

  const handleRegister = async () => {
    const first = firstname.trim();
    const last = lastname.trim();
    const mail = email.trim();
    const phone = phone_number.trim();

    // 1. ตรวจสอบข้อมูลพื้นฐาน
    if (!first || !last || !mail || !password || !confirmPassword || !phone) {
      Alert.alert("Error", "Please fill in all fields. Thank you.");
      return;
    }

    // 2. ตรวจสอบเงื่อนไขอื่นๆ
    if (!agree) {
      Alert.alert("Error", "Please agree to the processing of personal data.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    if (!/^[A-Za-z]+$/.test(first) || !/^[A-Za-z]+$/.test(last)) {
      Alert.alert("Error", "First name and last name must contain only letters");
      return;
    }
    if (!/^0[0-9]{9}$/.test(phone)) {
      Alert.alert("Error", "Invalid phone number");
      return;
    }
    if (/\s/.test(password)) {
      Alert.alert("Error", "Password cannot contain spaces");
      return;
    }

    try {
      // 🟢 ส่งค่า role เข้าไปใน backend เพื่อแยกว่าเป็นการสมัครแบบไหน
      const payload = {
        role: role,
        firstname: first,
        lastname: last,
        email: mail,
        password: password,
        phone_number: phone,
      };

      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log(result);
      
      if (response.ok) {
        Alert.alert("Register Success", result.message || "Go to OTP", [
          { text: "OK", onPress: () => navigation.navigate("OTP", { email: mail }) },
        ]);
      } else {
        Alert.alert("Error", result.message);
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Cannot connect to server");
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ImageBackground
        source={require("../../../src/public/pictures/background-welcome.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <Pressable style={styles.backButton} onPress={() => navigation.navigate("Welcome")}>
          <Feather name="chevron-left" size={24} color="black" />
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        <View style={styles.bottomSheet}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            
            {/* แท็บสลับระหว่าง PetOwner และ Vet */}
            <View style={styles.tabContainer}>
              <TouchableOpacity 
                style={[styles.tabButton, role === "petowner" && styles.tabButtonActive]}
                onPress={() => setRole("petowner")}
              >
                <Text style={[styles.tabText, role === "petowner" ? styles.tabTextActive : styles.tabTextInactive]}>
                  PetOwner
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tabButton, role === "vet" && styles.tabButtonActive]}
                onPress={() => setRole("vet")}
              >
                <Text style={[styles.tabText, role === "vet" ? styles.tabTextActive : styles.tabTextInactive]}>
                  Vet
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.title}>
              Get Started as {role === "petowner" ? "PetOwner" : "Vet"}
            </Text>

            {/* ช่องชื่อและนามสกุล (อยู่ในแถวเดียวกัน) */}
            <View style={styles.rowContainer}>
              <View style={[styles.inputWrapper, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.floatingLabel}>first name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter first name"
                  value={firstname}
                  onChangeText={setFirstname}
                />
              </View>

              <View style={[styles.inputWrapper, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.floatingLabel}>last name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter last name"
                  value={lastname}
                  onChangeText={setLastname}
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.floatingLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.floatingLabel}>Phone</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Phone number"
                value={phone_number}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.floatingLabel}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.floatingLabel}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>

            {/* Checkbox ยอมรับข้อตกลง */}
            <TouchableOpacity style={styles.checkboxContainer} onPress={() => setAgree(!agree)}>
              <View style={[styles.checkbox, agree && styles.checkboxActive]}>
                {agree && <Feather name="check" size={14} color="#FFF" />}
              </View>
              <Text style={styles.checkboxText}>
                I agree to processing of <Text style={styles.linkText}>Personal data</Text>
              </Text>
            </TouchableOpacity>

            <Pressable
              style={({ pressed }) => [styles.signInButton, pressed && styles.signInButtonPressed]}
              onPress={handleRegister}
            >
              <Text style={styles.signInButtonText}>Sign up</Text>
            </Pressable>

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Pressable onPress={() => navigation.navigate("Login")}>
                <Text style={styles.signUpText}>Sign in</Text>
              </Pressable>
            </View>

          </ScrollView>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10,
  },
  backText: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 5,
    color: "#333",
  },
  bottomSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 25,
    paddingTop: 30,
    paddingBottom: 20,
    height: '85%',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#7796AB",
    borderRadius: 25,
    marginBottom: 20,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 25,
  },
  tabButtonActive: {
    backgroundColor: "#FFFFFF",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  tabTextActive: {
    color: "#7796AB",
  },
  tabTextInactive: {
    color: "#FFFFFF",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#8EB4D0",
    textAlign: "center",
    marginBottom: 30,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: "#D3D3D3",
    borderRadius: 12,
    marginBottom: 22,
    paddingHorizontal: 15,
    paddingVertical: 5,
    position: "relative",
    backgroundColor: "#FFFFFF",
  },
  floatingLabel: {
    position: "absolute",
    top: -10,
    left: 15,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 5,
    fontSize: 12,
    color: "#666",
    fontWeight: "bold",
  },
  input: {
    fontSize: 14,
    color: "#333",
    paddingVertical: 10,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: "#D3D3D3",
    borderRadius: 4,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxActive: {
    backgroundColor: "#8EB4D0",
    borderColor: "#8EB4D0",
  },
  checkboxText: {
    fontSize: 13,
    color: "#999",
  },
  linkText: {
    color: "#8EB4D0",
    fontWeight: "bold",
  },
  signInButton: {
    backgroundColor: "#9FBBD0",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 20,
  },
  signInButtonPressed: {
    backgroundColor: "#86A7BD",
  },
  signInButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#A9A9A9",
  },
  signUpText: {
    fontSize: 14,
    color: "#8EB4D0",
    fontWeight: "bold",
  },
});