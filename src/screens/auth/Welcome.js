import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function Register() {
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

          <Text style={styles.titleWelcome}>Welcome to </Text>
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
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
