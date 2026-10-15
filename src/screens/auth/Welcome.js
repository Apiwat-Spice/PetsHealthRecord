import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ImageBackground, Image, Pressable, SafeAreaView } from 'react-native';

export default function Welcome({ navigation }) {
  return (
    <ImageBackground source={require('../../../src/public/pictures/background-welcome-new.png')} style={styles.background} resizeMode="cover">
      <SafeAreaView style={styles.container}>
        <View style={styles.contentContainer}>
          <View style={styles.logoContainer}>
            <Image source={require('../../../src/public/pictures/Logo.png')} style={styles.logo} resizeMode="contain" />
          </View>
          <Text style={styles.titleWelcome}>Welcome to</Text>
          <Text style={styles.titleApp}>Digital Pet Health Record</Text>
          <Text style={styles.slogan}>“Take better care of your pet with everything{'\n'}you need in one place.”</Text>
        </View>

        <View style={styles.buttonContainer}>
          <Pressable style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} onPress={() => navigation.navigate("Login")}>
            <Text style={styles.buttonTextWhite}>Login</Text>
          </Pressable>
        </View>
      </SafeAreaView>
      <StatusBar style="dark" />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%' },
  container: { flex: 1, justifyContent: 'space-between' },
  contentContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, marginTop: 40 },
  logoContainer: { backgroundColor: '#FFFFFF', width: 200, height: 200, borderRadius: 45, justifyContent: 'center', alignItems: 'center', marginBottom: 40, elevation: 5 },
  logo: { width: 160, height: 140 },
  titleWelcome: { fontSize: 42, fontWeight: '900', color: '#5A7584', marginBottom: 10 },
  titleApp: { fontSize: 22, fontWeight: 'bold', color: '#5A7584', marginBottom: 20 },
  slogan: { fontSize: 14, fontStyle: 'italic', fontWeight: 'bold', textAlign: 'center', color: '#1A1A1A', lineHeight: 22 },
  buttonContainer: { paddingHorizontal: 24, paddingBottom: 40 },
  button: { width: '100%', height: 60, borderRadius: 12, backgroundColor: '#6A899C', justifyContent: 'center', alignItems: 'center', elevation: 3 },
  buttonPressed: { opacity: 0.8 },
  buttonTextWhite: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' }
});