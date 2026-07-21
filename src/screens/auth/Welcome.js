import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ImageBackground, Image, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons'; 

export default function WelcomeScreen({ navigation }) {
  return (
    <ImageBackground
      source={require('../../../assets/background-welcome.png')} 
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        
        <Pressable style={styles.infoButton}>
          <Feather name="info" size={24} color="black" />
        </Pressable>

        <View style={styles.contentContainer}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/Logo.png')}
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

        <View style={styles.bottomBar}>
          <Pressable 
            style={({ pressed }) => [
              styles.button, 
              styles.buttonBorder,
              pressed && styles.buttonPressed 
            ]}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.buttonText}>Sign in</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed
            ]}
            onPress={() => navigation.navigate("Register")}
          >
            <Text style={styles.buttonText}>Sign up</Text>
          </Pressable>
        </View>

      </View>
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
  },
  infoButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 45,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingBottom: 60, 
  },
  logoContainer: {
    backgroundColor: '#FFFFFF',
    width: 170,
    height: 170,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3, 
  },
  logo: {
    width: 150, 
    height: 130,
  },
  titleWelcome: {
    fontSize: 40, 
    fontWeight: '900',
    color: '#5A7584',
    marginBottom: 8,
  },
  titleApp: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#5A7584',
    marginBottom: 25,
  },
  slogan: {
    fontSize: 14,
    fontStyle: 'italic',
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
    lineHeight: 22,
  },
  bottomBar: {
    flexDirection: 'row',
    height: 100,
    backgroundColor: '#F7F7F2',
    borderTopWidth: 1,
    borderColor: '#D3D3D3',
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonBorder: {
    borderRightWidth: 1,
    borderColor: '#D3D3D3',
  },
  buttonPressed: {
    backgroundColor: '#FFFFFF', 
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5A7584',
  }
});