import { useState } from 'react';
import { StyleSheet, Text, View, ImageBackground, Pressable, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';


export default function ForgotPassword({ navigation }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleResetPassword = () => {
        if (!email) {
            Alert.alert('แจ้งเตือน', 'กรุณากรอกอีเมล');
            return;
        }

        setLoading(true);

        setTimeout(() => {
            setLoading(false);
            Alert.alert('สำเร็จ', 'สำเร็จ');
            navigation.navigate('Login');
        }, 1000);
    };

    return (
        <ImageBackground
            source={require('../../../src/public/pictures/background-welcome.png')}
            style={styles.background}
            resizeMode="cover"
        >
            <Pressable style={styles.backButton} onPress={() => navigation.navigate('Login')}>
                <Feather name="chevron-left" size={24} color="black" />
                <Text style={styles.backText}>Back</Text>
            </Pressable>
            <View style={styles.bottomSheet}>
                <Text style={styles.title}>Reset Password</Text>
                <Text style={styles.description}>Please enter the email address associated with your account. We will send you an OTP or a link to reset your password.</Text>

                {/* Input: Email */}
                <View style={styles.inputWrapper}>
                    <Text style={styles.floatingLabel}>Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your registered email"
                        placeholderTextColor="#A9A9A9"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                </View>
                {/* Send Reset Link button */}
                <Pressable
                    style={({ pressed }) => [
                        styles.submitButton,
                        pressed && styles.submitButtonPressed,
                        loading && styles.submitButtonDisabled
                    ]}
                    onPress={handleResetPassword}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>Send Reset Link</Text>
                    )}
                </Pressable>

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
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 5,
    },
    bottomSheet: {
        backgroundColor: '#FFFFFF',
        height: '65%',
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
        marginBottom: 15,
    },
    description: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 20,
    },
    inputWrapper: {
        borderWidth: 1,
        borderColor: '#D3D3D3',
        borderRadius: 10,
        marginBottom: 35,
        paddingHorizontal: 15,
        paddingVertical: 12,
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
        fontWeight: '400',
        color: '#333',
        paddingVertical: 0,
    },
    submitButton: {
        backgroundColor: '#9FBBD0',
        borderRadius: 10,
        paddingVertical: 15,
        alignItems: 'center',
    },
    submitButtonPressed: {
        backgroundColor: '#86A7BD',
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});