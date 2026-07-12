import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { auth, db } from '../../services/firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function LoginScreen() {
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [profession, setProfession] = useState('Student');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const router = useRouter();

    const handleAuth = async () => {
        setLoading(true);
        setError('');
        try {
            if (isRegistering) {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await setDoc(doc(db, "users", userCredential.user.uid), {
                    name,
                    phone,
                    profession,
                    email,
                    role: "user"
                });
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            router.replace('/home');
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: '#FCFBF8' }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.container}>
                
                {/* Top Right Logo Area */}
                <View style={styles.topLogoContainer}>
                    <View style={{ alignItems: 'flex-end', marginRight: 8 }}>
                        <Text style={styles.logoTextMain}>LEVIDEX</Text>
                        <Text style={styles.logoTextSub}>Electronics</Text>
                    </View>
                    <MaterialCommunityIcons name="lightning-bolt" size={32} color="#2B2B36" />
                </View>

                {/* Main Titles */}
                <View style={styles.titleContainer}>
                    <Text style={styles.titleBig}>Hi !</Text>
                    <Text style={styles.titleBig}>{isRegistering ? 'Register' : 'Welcome'}</Text>
                    <Text style={styles.subtitle}>
                        {isRegistering ? "Im waiting for you, please fill all details" : "Im waiting for you, please enter your detail"}
                    </Text>
                </View>

                {error ? <Text style={styles.error}>{error}</Text> : null}

                {/* Input Fields */}
                <View style={styles.formContainer}>
                    {isRegistering && (
                        <>
                            <TextInput 
                                style={styles.input} 
                                placeholder="Full Name" 
                                placeholderTextColor="#C4C4C4"
                                value={name} 
                                onChangeText={setName} 
                            />
                            <TextInput 
                                style={styles.input} 
                                placeholder="Phone Number" 
                                placeholderTextColor="#C4C4C4"
                                value={phone} 
                                keyboardType="phone-pad" 
                                onChangeText={setPhone} 
                            />
                            <TextInput 
                                style={styles.input} 
                                placeholder="Profession (e.g. Engineer)" 
                                placeholderTextColor="#C4C4C4"
                                value={profession} 
                                onChangeText={setProfession} 
                            />
                        </>
                    )}

                    <TextInput 
                        style={styles.input} 
                        placeholder={isRegistering ? "Email Address" : "Username, Email or Phone Number"} 
                        placeholderTextColor="#C4C4C4"
                        value={email} 
                        autoCapitalize="none" 
                        keyboardType="email-address" 
                        onChangeText={setEmail} 
                    />
                    
                    <View style={styles.passwordContainer}>
                        <TextInput 
                            style={styles.passwordInput} 
                            placeholder="Password" 
                            placeholderTextColor="#C4C4C4"
                            value={password} 
                            secureTextEntry={!showPassword} 
                            onChangeText={setPassword} 
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                            <MaterialCommunityIcons name={showPassword ? "eye" : "eye-outline"} size={22} color="#C4C4C4" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Middle Layer (Remember / Forgot) */}
                {!isRegistering && (
                    <View style={styles.middleLayer}>
                        <TouchableOpacity style={styles.checkboxContainer} onPress={() => setRememberMe(!rememberMe)}>
                            <MaterialCommunityIcons 
                                name={rememberMe ? "checkbox-marked" : "checkbox-blank-outline"} 
                                size={20} 
                                color={rememberMe ? "#C4C4C4" : "#C4C4C4"} 
                            />
                            <Text style={styles.rememberText}>Remember Me</Text>
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <Text style={styles.forgotText}>Forgot Password ?</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Action Button */}
                <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{isRegistering ? 'Sign Up' : 'Log In'}</Text>}
                </TouchableOpacity>

                {/* Footer Toggle */}
                <TouchableOpacity style={styles.footerContainer} onPress={() => setIsRegistering(!isRegistering)}>
                    <Text style={styles.footerText}>
                        {isRegistering ? "Already have an account ? " : "Don't have an account ? "}
                    </Text>
                    <Text style={styles.footerTextBold}>
                        {isRegistering ? "Log In" : "Sign Up"}
                    </Text>
                </TouchableOpacity>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        paddingHorizontal: 28,
        paddingTop: Platform.OS === 'android' ? 60 : 40,
        paddingBottom: 40,
    },
    topLogoContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: 50,
    },
    logoTextMain: {
        fontSize: 16,
        fontWeight: '900',
        color: '#2B2B36',
    },
    logoTextSub: {
        fontSize: 12,
        fontWeight: '800',
        color: '#2B2B36',
    },
    titleContainer: {
        marginBottom: 50,
    },
    titleBig: {
        fontSize: 56,
        fontWeight: '900',
        color: '#2B2B36',
        letterSpacing: -1.5,
        lineHeight: 62,
    },
    subtitle: {
        fontSize: 14,
        color: '#A0A0A0',
        marginTop: 12,
        fontWeight: '500',
    },
    formContainer: {
        marginBottom: 10,
    },
    input: {
        borderBottomWidth: 1.5,
        borderBottomColor: '#D3D3D3',
        paddingVertical: 12,
        fontSize: 16,
        color: '#2B2B36',
        marginBottom: 24,
        fontWeight: '500',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1.5,
        borderBottomColor: '#D3D3D3',
        marginBottom: 20,
    },
    passwordInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
        color: '#2B2B36',
        fontWeight: '500',
    },
    eyeIcon: {
        padding: 5,
    },
    middleLayer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 35,
        paddingHorizontal: 2,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rememberText: {
        fontSize: 13,
        color: '#A0A0A0',
        marginLeft: 6,
        fontWeight: '500',
    },
    forgotText: {
        fontSize: 13,
        color: '#A0A0A0',
        fontWeight: '500',
    },
    button: {
        backgroundColor: '#2F2F3B',
        paddingVertical: 18,
        alignItems: 'center',
        shadowColor: '#2F2F3B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 3,
        marginBottom: 60, // Keep it high so the "Don't have an account" flows below nicely
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
    },
    footerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 'auto',
    },
    footerText: {
        color: '#A0A0A0',
        fontSize: 15,
        fontWeight: '500',
    },
    footerTextBold: {
        color: '#2B2B36',
        fontSize: 15,
        fontWeight: '800',
    },
    error: {
        color: '#ff3b30',
        marginBottom: 20,
        fontSize: 13,
        fontWeight: '600'
    }
});
