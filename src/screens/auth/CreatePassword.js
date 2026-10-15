import { useState } from 'react';
import { StyleSheet, Text, View, ImageBackground, Pressable, TextInput, Alert, ActivityIndicator } from 'react-native';
import * as SecureStore from "expo-secure-store";
import { API_URL } from '../../config';

export default function CreatePassword({ navigation, route, onLoginSuccess }) {
  const { email } = route.params || {};
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreatePassword = async () => {
    if (password.length < 6) return Alert.alert("แจ้งเตือน", "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
    if (password !== confirmPassword) return Alert.alert("แจ้งเตือน", "รหัสผ่านไม่ตรงกัน");

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/create-password`, {
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
        Alert.alert("เกิดข้อผิดพลาด", result.message);
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
        <Text style={styles.titleMain}>Create Password</Text>
        <Text style={styles.titleSub}>ตั้งรหัสผ่านสำหรับ {email}</Text>
        
        <View style={styles.inputWrapper}>
          <Text style={styles.floatingLabel}>New Password</Text>
          <TextInput style={styles.input} placeholder="รหัสผ่านอย่างน้อย 6 ตัว" value={password} onChangeText={setPassword} secureTextEntry />
        </View>
        
        <View style={styles.inputWrapper}>
          <Text style={styles.floatingLabel}>Confirm Password</Text>
          <TextInput style={styles.input} placeholder="ยืนยันรหัสผ่าน" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
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

// 🟢 โค้ด Styles ที่หายไป
const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: '#FFFFFF', height: '75%', borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingHorizontal: 30, paddingTop: 50, paddingBottom: 20 },
  titleMain: { fontSize: 32, fontWeight: 'bold', color: '#8EB4D0', textAlign: 'center' },
  titleSub: { fontSize: 16, fontWeight: 'bold', color: '#8EB4D0', textAlign: 'center', marginBottom: 40 },
  inputWrapper: { borderWidth: 1, borderColor: '#D3D3D3', borderRadius: 10, marginBottom: 20, paddingHorizontal: 15, paddingVertical: 10, position: 'relative' },
  floatingLabel: { position: 'absolute', top: -10, left: 15, backgroundColor: '#FFFFFF', paddingHorizontal: 5, fontSize: 12, color: '#666', fontWeight: 'bold' },
  input: { fontSize: 16, color: '#333' },
  signInButton: { backgroundColor: '#9FBBD0', borderRadius: 10, paddingVertical: 15, alignItems: 'center', marginTop: 15 },
  signInButtonPressed: { backgroundColor: '#86A7BD' },
  signInButtonDisabled: { opacity: 0.7 },
  signInButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});