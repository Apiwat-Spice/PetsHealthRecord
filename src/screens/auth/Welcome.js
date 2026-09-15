import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ImageBackground, Image, Pressable, SafeAreaView } from 'react-native';

export default function Welcome({ navigation }) {
  return (
    <ImageBackground
      source={require('../../../src/public/pictures/background-welcome-new.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>

        {/* Main Content Centered */}
        <View style={styles.contentContainer}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../src/public/pictures/Logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.titleWelcome}>Welcome to</Text>
          <Text style={styles.titleApp}>Digital Pet Health Record</Text>
          <Text style={styles.slogan}>
            “Take better care of your pet with everything{'\n'}you need in one place.”
          </Text>
        </View>

        {/* Floating Action Buttons at the Bottom */}
        <View style={styles.buttonContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.buttonSignIn,
              pressed && styles.buttonPressed
            ]}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.buttonTextWhite}>Sign in</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.buttonSignUp,
              pressed && styles.buttonPressed
            ]}
            onPress={() => navigation.navigate("Register")}
          >
            <Text style={styles.buttonTextWhite}>Sign up</Text>
          </Pressable>
        </View>

      </SafeAreaView>
      <StatusBar style="dark" />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between', // Pushes content to middle and buttons to bottom
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 40, // Adjust this to move the block up or down
  },
  logoContainer: {
    backgroundColor: '#FFFFFF',
    width: 200,
    height: 200,
    borderRadius: 45, // Soft rounded corners for the app icon look
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  logo: {
    width: 160,
    height: 140,
  },
  titleWelcome: {
    fontSize: 42,
    fontWeight: '900',
    color: '#5A7584',
    marginBottom: 10,
  },
  titleApp: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#5A7584',
    marginBottom: 20,
  },
  slogan: {
    fontSize: 14,
    fontStyle: 'italic',
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1A1A1A',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 40, // Space from the bottom edge
  },
  button: {
    flex: 0.48, // Takes up just under half the row width each
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonSignIn: {
    backgroundColor: '#A0C4D8', // Light blue/gray from the reference image
  },
  buttonSignUp: {
    backgroundColor: '#6A899C', // Darker blue/gray from the reference image
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonTextWhite: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  }
});