import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, ImageBackground, Pressable, TextInput, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as SecureStore from "expo-secure-store";
import { API_URL } from '../../config';

export default function CreatePassword({ navigation, route, onLoginSuccess }) {
  const { email, isReset } = route.params || {};
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const confirmPasswordInputRef = useRef(null);

  const handleCreatePassword = async () => {
    if (password.length < 6) return Alert.alert("แจ้งเตือน", "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
    if (password !== confirmPassword) return Alert.alert("แจ้งเตือน", "รหัสผ่านไม่ตรงกัน");

    setLoading(true);
    try {
      let endpoint = isReset ? `${API_URL}/change-password` : `${API_URL}/create-password`;

      let response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      let result = await response.json();

      if (!response.ok && !isReset && result.message?.includes("ตั้งรหัสผ่านไปแล้ว")) {
        response = await fetch(`${API_URL}/change-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        result = await response.json();
      }

      if (response.ok) {
        if (result.token) {
          await SecureStore.setItemAsync("token", result.token);
          await SecureStore.setItemAsync("user", JSON.stringify(result.user));
          if (result.profile) await SecureStore.setItemAsync("pet_owners", JSON.stringify(result.profile));
          if (onLoginSuccess) onLoginSuccess();
        } else {
          Alert.alert("สำเร็จ", "ตั้งรหัสผ่านใหม่เรียบร้อยแล้ว กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่", [
            {
              text: "ตกลง",
              onPress: () => navigation.navigate("Login", { email })
            }
          ]);
        }
      } else {
        Alert.alert("เกิดข้อผิดพลาด", result.message || "ไม่สามารถตั้งรหัสผ่านได้");
      }
    } catch (error) {
      Alert.alert("Error", "เชื่อมต่อ Server ไม่ได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={require('../../../src/public/pictures/background-welcome.png')} style={styles.background} resizeMode="cover">
      <View style={styles.bottomSheet}>
        <Text style={styles.titleMain}>{isReset ? "New Password" : "Create Password"}</Text>
        <Text style={styles.titleSub}>ตั้งรหัสผ่านสำหรับ {email}</Text>

        <View style={styles.inputWrapper}>
          <Text style={styles.floatingLabel}>New Password</Text>
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={styles.input}
              placeholder="รหัสผ่านอย่างน้อย 6 ตัว"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              returnKeyType="next"
              onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
            />
            <TouchableOpacity style={styles.eyeIconBtn} onPress={() => setShowPassword(!showPassword)}>
              <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.floatingLabel}>Confirm Password</Text>
          <View style={styles.passwordInputContainer}>
            <TextInput
              ref={confirmPasswordInputRef}
              style={styles.input}
              placeholder="ยืนยันรหัสผ่าน"
              placeholderTextColor="#999"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              returnKeyType="done"
              onSubmitEditing={handleCreatePassword}
            />
            <TouchableOpacity style={styles.eyeIconBtn} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Feather name={showConfirmPassword ? "eye" : "eye-off"} size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.signInButton, pressed && styles.signInButtonPressed, loading && styles.signInButtonDisabled]}
          onPress={handleCreatePassword}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.signInButtonText}>ตั้งรหัสและเข้าสู่ระบบ</Text>}
        </Pressable>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: '#FFFFFF', height: '75%', borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingHorizontal: 30, paddingTop: 50, paddingBottom: 20 },
  titleMain: { fontSize: 32, fontWeight: 'bold', color: '#5A7584', textAlign: 'center' },
  titleSub: { fontSize: 16, fontWeight: 'bold', color: '#8EB4D0', textAlign: 'center', marginBottom: 30 },
  inputWrapper: { borderWidth: 1, borderColor: '#D3D3D3', borderRadius: 10, marginBottom: 20, paddingHorizontal: 15, height: 52, justifyContent: 'center', backgroundColor: '#FFFFFF', position: 'relative' },
  floatingLabel: { position: 'absolute', top: -10, left: 15, backgroundColor: '#FFFFFF', paddingHorizontal: 5, fontSize: 12, color: '#5A7584', fontWeight: 'bold' },
  passwordInputContainer: { flexDirection: 'row', alignItems: 'center', height: '100%' },
  input: { flex: 1, fontSize: 16, color: '#333', height: '100%', paddingVertical: 0 },
  eyeIconBtn: { padding: 4 },
  signInButton: { backgroundColor: '#6A899C', borderRadius: 10, height: 52, justifyContent: 'center', alignItems: 'center', marginTop: 15 },
  signInButtonPressed: { backgroundColor: '#86A7BD' },
  signInButtonDisabled: { opacity: 0.7 },
  signInButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
}); 