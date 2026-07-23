import { useState } from 'react';
import { StyleSheet, Text, View, ImageBackground, Pressable, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import { supabase } from '../../../server/config/supabase.js';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('แจ้งเตือน', 'กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('เข้าสู่ระบบล้มเหลว', error.message);
    } else {
      Alert.alert('สำเร็จ', 'เข้าสู่ระบบเรียบร้อยแล้ว!');
      // รอใส่ navigation.replace('Dashboard')
    }
    setLoading(false);
  };

  return (
    <ImageBackground
      source={require('../../../src/public/pictures/background-welcome.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <Pressable style={styles.backButton} onPress={() => navigation.navigate('Welcome')}>
        <Feather name="chevron-left" size={24} color="black" />
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <View style={styles.bottomSheet}>
        <Text style={styles.title}>Welcome Back!</Text>

        {/* Email */}
        <View style={styles.inputWrapper}>
          <Text style={styles.floatingLabel}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Email"
            placeholderTextColor="#A9A9A9"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        {/*Password */}
        <View style={styles.inputWrapper}>
          <Text style={styles.floatingLabel}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter password"
            placeholderTextColor="#A9A9A9"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* Remember me & Forgot Password */}
        <View style={styles.optionsRow}>
          <View style={styles.rememberMeContainer}>
            <Checkbox
              style={styles.checkbox}
              value={rememberMe}
              onValueChange={setRememberMe}
              color={rememberMe ? '#8EB4D0' : undefined}
            />
            <Text style={styles.rememberMeText}>Remember me</Text>
          </View>
          <Pressable onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </Pressable>
        </View>

        {/* Sign in button */}
        <Pressable
          style={({ pressed }) => [
            styles.signInButton,
            pressed && styles.signInButtonPressed,
            loading && styles.signInButtonDisabled
          ]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.signInButtonText}>Sign in</Text>
          )}
        </Pressable>

        {/* Move to Sign up */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Don't have an account ? </Text>
          <Pressable onPress={() => navigation.navigate("Register")}>
            <Text style={styles.signUpText}>Sign up</Text>
          </Pressable>
        </View>

      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    height: '75%',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 30,
    paddingTop: 50,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8EB4D0',
    textAlign: 'center',
    marginBottom: 40,
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: '#D3D3D3',
    borderRadius: 10,
    marginBottom: 25,
    paddingHorizontal: 15,
    paddingVertical: 5,
    position: 'relative',
  },
  floatingLabel: {
    position: 'absolute',
    top: -10,
    left: 15,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 5,
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
  },
  input: {
    fontSize: 14,
    color: '#333',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 35,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    marginRight: 8,
    borderRadius: 4,
    borderColor: '#D3D3D3',
  },
  rememberMeText: {
    fontSize: 14,
    color: '#A9A9A9',
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#8EB4D0',
    fontWeight: 'bold',
  },
  signInButton: {
    backgroundColor: '#9FBBD0',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 30,
  },
  signInButtonPressed: {
    backgroundColor: '#86A7BD',
  },
  signInButtonDisabled: {
    opacity: 0.7,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#A9A9A9',
  },
  signUpText: {
    fontSize: 14,
    color: '#8EB4D0',
    fontWeight: 'bold',
  },
});