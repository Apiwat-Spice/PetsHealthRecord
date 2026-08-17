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
} from "react-native";
import { Feather } from '@expo/vector-icons';
import { API_URL } from '../../config';

export default function Register({ navigation }) {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone_number, setPhoneNumber] = useState("");

  const handleRegister = async () => {
    const first = firstname.trim();
    const last = lastname.trim();
    const mail = email.trim();
    const phone = phone_number.trim();

    if (!first || !last || !mail || !password || !confirmPassword || !phone) {
      Alert.alert("Error", "Please fill in all fields Thank you");
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
    if (/\s/.test(confirmPassword)) {
      Alert.alert("Error", "Confirm Password cannot contain spaces");
      return;
    }
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstname: first,
          lastname: last,
          email: mail,
          password,
          phone_number: phone,
        }),
      });

      const result = await response.json();
      console.log(result);
      if (response.ok) {

        Alert.alert(
          "Register Success Go to OTP",
          result.message,
          [
            {
              text: "OK",
              onPress: () => navigation.navigate("OTP",{email:mail}),
            },
          ]
        );
      } else {
        Alert.alert("Error", result.message);
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Cannot connect to server");
    }
  };

  return (
    <ImageBackground
      source={require("../../../src/public/pictures/background-welcome.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <Pressable
        style={styles.backButton}
        onPress={() => navigation.navigate("Welcome")}
      >
        <Feather name="chevron-left" size={24} color="black" />
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <View style={styles.bottomSheet}>
        <Text style={styles.title}>Get Started as PetOwner</Text>

        <View style={styles.inputWrapper}>
          <Text style={styles.floatingLabel}>First Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter first name"
            value={firstname}
            onChangeText={setFirstname}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.floatingLabel}>Last Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter last name"
            value={lastname}
            onChangeText={setLastname}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.floatingLabel}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.floatingLabel}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.floatingLabel}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirm password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.floatingLabel}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter phone number"
            value={phone_number}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.signInButton,
            pressed && styles.signInButtonPressed,
          ]}
          onPress={handleRegister}
        >
          <Text style={styles.signInButtonText}>Register</Text>
        </Pressable>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>
            Already have an account?{" "}
          </Text>

          <Pressable onPress={() => navigation.navigate("Login")}>
            <Text style={styles.signUpText}>Sign in</Text>
          </Pressable>
        </View>
      </View>
    </ImageBackground>
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
  },

  backText: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 5,
  },

  bottomSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 25,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#8EB4D0",
    textAlign: "center",
    marginBottom: 30,
  },

  inputWrapper: {
    borderWidth: 1,
    borderColor: "#D3D3D3",
    borderRadius: 10,
    marginBottom: 18,
    paddingHorizontal: 15,
    paddingVertical: 5,
    position: "relative",
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
    paddingVertical: 8,
  },

  signInButton: {
    backgroundColor: "#9FBBD0",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 25,
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