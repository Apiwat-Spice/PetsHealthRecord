import React, { useState } from 'react';
import { StyleSheet, Text, View, ImageBackground, Pressable, TextInput, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as SecureStore from "expo-secure-store";
import { API_URL } from '../../config';

export default function LoginPassword({ navigation, route, onLoginSuccess }) {
  const { email } = route.params || {};
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);

  const handleLogin = async () => {
    if (!password) return Alert.alert("แจ้งเตือน", "กรุณากรอกรหัสผ่าน");
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();

      if (response.ok) {
        await SecureStore.setItemAsync("token", result.token);
        await SecureStore.setItemAsync("user", JSON.stringify(result.user));
        if (result.profile) await SecureStore.setItemAsync("pet_owners", JSON.stringify(result.profile));
        if (onLoginSuccess) onLoginSuccess();
      } else {
        Alert.alert("ล็อกอินไม่สำเร็จ", result.message);
      }
    } catch (error) {
      Alert.alert("Error", "เชื่อมต่อ Server ไม่ได้");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) return Alert.alert("แจ้งเตือน", "ไม่พบข้อมูลอีเมล");

    setLoadingOtp(true);
    try {
      const response = await fetch(`${API_URL}/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();

      if (response.ok) {
        Alert.alert("ส่งรหัส OTP สำเร็จ", "ระบบได้ส่งรหัส OTP ไปยังอีเมลของคุณแล้ว", [
          {
            text: "ตกลง",
            onPress: () => navigation.navigate("OTP", { email, isReset: true })
          }
        ]);
      } else {
        Alert.alert("เกิดข้อผิดพลาด", result.message || "ไม่สามารถส่ง OTP ได้");
      }
    } catch (error) {
      Alert.alert("Error", "เชื่อมต่อ Server ไม่ได้");
    } finally {
      setLoadingOtp(false);
    }
  };

  return (
    <ImageBackground source={require('../../../src/public/pictures/background-welcome.png')} style={styles.background} resizeMode="cover">
      <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
        <Feather name="chevron-left" size={24} color="#1A1A1A" />
        <Text style={styles.backText}>Back</Text>
      </Pressable>
      
      <View style={styles.bottomSheet}>
        <Text style={styles.titleMain}>Welcome Back</Text>
        <Text style={styles.titleSub}>{email}</Text>
        
        <View style={styles.inputWrapper}>
          <Text style={styles.floatingLabel}>Password</Text>
          <View style={styles.passwordInputContainer}>
            <TextInput 
              style={styles.input} 
              placeholder="กรอกรหัสผ่าน" 
              placeholderTextColor="#999"
              value={password} 
              onChangeText={setPassword} 
              secureTextEntry={!showPassword} 
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity style={styles.eyeIconBtn} onPress={() => setShowPassword(!showPassword)}>
              <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.forgotBtn} 
          onPress={handleForgotPassword}
          disabled={loadingOtp || loading}
        >
          {loadingOtp ? (
            <ActivityIndicator size="small" color="#5A7584" />
          ) : (
            <Text style={styles.forgotBtnText}>ลืมรหัสผ่าน?</Text>
          )}
        </TouchableOpacity>
        
        <Pressable 
          style={({ pressed }) => [styles.signInButton, pressed && styles.signInButtonPressed, loading && styles.signInButtonDisabled]} 
          onPress={handleLogin} 
          disabled={loading || loadingOtp}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.signInButtonText}>Login</Text>}
        </Pressable>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', justifyContent: 'flex-end' },
  backButton: { position: 'absolute', top: 50, left: 20, flexDirection: 'row', alignItems: 'center' },
  backText: { fontSize: 18, fontWeight: 'bold', marginLeft: 5, color: '#1A1A1A' },
  bottomSheet: { backgroundColor: '#FFFFFF', height: '75%', borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingHorizontal: 30, paddingTop: 50, paddingBottom: 20 },
  titleMain: { fontSize: 32, fontWeight: 'bold', color: '#5A7584', textAlign: 'center' },
  titleSub: { fontSize: 16, fontWeight: 'bold', color: '#8EB4D0', textAlign: 'center', marginBottom: 30 },
  inputWrapper: { borderWidth: 1, borderColor: '#D3D3D3', borderRadius: 10, marginBottom: 8, paddingHorizontal: 15, height: 52, justifyContent: 'center', backgroundColor: '#FFFFFF', position: 'relative' },
  floatingLabel: { position: 'absolute', top: -10, left: 15, backgroundColor: '#FFFFFF', paddingHorizontal: 5, fontSize: 12, color: '#5A7584', fontWeight: 'bold' },
  passwordInputContainer: { flexDirection: 'row', alignItems: 'center', height: '100%' },
  input: { flex: 1, fontSize: 16, color: '#333', height: '100%', paddingVertical: 0 },
  eyeIconBtn: { padding: 4 },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 25, paddingTop: 4 },
  forgotBtnText: { fontSize: 13, color: '#5A7584', fontWeight: 'bold' },
  signInButton: { backgroundColor: '#6A899C', borderRadius: 10, height: 52, justifyContent: 'center', alignItems: 'center' },
  signInButtonPressed: { backgroundColor: '#86A7BD' },
  signInButtonDisabled: { opacity: 0.7 },
  signInButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});