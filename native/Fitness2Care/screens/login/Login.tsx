import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ImageBackground,
    Keyboard,
    TouchableWithoutFeedback,
    Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemberContext } from '../../_common/context/MemberContext';
import { UserService } from '../../_components/services/UserService';

type RootStackParamList = {
    Dashboard: undefined;
    Login: undefined;
};

const Login = () => {
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        phone: "",
        weight: "",
    });

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { setMember } = useMemberContext();

    const handleChange = (name: string, value: string) => {
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleLogin = async () => {
        try {
            const member = await UserService.login(form.email, form.password);
            setMember(member);
            navigation.navigate('Dashboard');
        } catch (err) {
            setError("Falsche Anmeldeinformationen");
            Alert.alert("Fehler", "Falsche Anmeldeinformationen");
        }
    };

    const handleRegister = async () => {
        try {
            const member = await UserService.register({
                firstName: form.firstName,
                lastName: form.lastName,
                email: form.email,
                password: form.password,
                phone: form.phone,
                weight: parseInt(form.weight, 10),
            });
            setMember(member);
            navigation.navigate('Dashboard');
        } catch (err) {
            setError("Registrierung fehlgeschlagen");
            Alert.alert("Fehler", "Registrierung fehlgeschlagen");
        }
    };

    const handleSubmit = () => {
        setError("");
        isRegisterMode ? handleRegister() : handleLogin();
    };

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    return (
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
            <View style={styles.container}>
                    <View style={styles.authContainer}>
                        <View style={styles.card}>
                            <Text style={styles.title}>
                                {isRegisterMode ? "Registrieren" : "Login"}
                            </Text>

                            {error ? (
                                <View style={styles.alert}>
                                    <Text style={styles.alertText}>{error}</Text>
                                </View>
                            ) : null}

                            {isRegisterMode && (
                                <>
                                    <Text style={styles.label}>Vorname</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Max"
                                        value={form.firstName}
                                        onChangeText={(text) => handleChange('firstName', text)}
                                    />

                                    <Text style={styles.label}>Nachname</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Mustermann"
                                        value={form.lastName}
                                        onChangeText={(text) => handleChange('lastName', text)}
                                    />

                                    <Text style={styles.label}>Telefon</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="0123456789"
                                        value={form.phone}
                                        onChangeText={(text) => handleChange('phone', text)}
                                        keyboardType="phone-pad"
                                    />

                                    <Text style={styles.label}>Gewicht (kg)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="80"
                                        value={form.weight}
                                        onChangeText={(text) => handleChange('weight', text)}
                                        keyboardType="numeric"
                                    />
                                </>
                            )}

                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="max.musterman@gmail.com"
                                value={form.email}
                                onChangeText={(text) => handleChange('email', text)}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />

                            <Text style={styles.label}>Passwort</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="********"
                                value={form.password}
                                onChangeText={(text) => handleChange('password', text)}
                                secureTextEntry
                                onSubmitEditing={handleSubmit}
                            />

                            <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit}>
                                <Text style={styles.buttonText}>
                                    {isRegisterMode ? "Registrieren" : "Login"}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.linkButton}
                                onPress={() => {
                                    setIsRegisterMode(!isRegisterMode);
                                    setError("");
                                }}
                            >
                                <Text style={styles.linkText}>
                                    {isRegisterMode ? "Zum Login wechseln" : "Jetzt registrieren"}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.promoContainer}>
                            <Text style={styles.promoTitle}>
                                {!isRegisterMode ? "Neu hier?" : "Willkommen zurück!"}
                            </Text>
                            <Text style={styles.promoText}>
                                {!isRegisterMode
                                    ? "Jetzt registrieren und neue Möglichkeiten entdecken!"
                                    : "Du hast schon einen Account?"}
                            </Text>
                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={() => {
                                    setIsRegisterMode(!isRegisterMode);
                                    setError("");
                                }}
                            >
                                <Text style={styles.secondaryButtonText}>
                                    {!isRegisterMode ? "Registrieren" : "Login"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center',
    },
    authContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'rgba(255,255,255,0.8)',
    },
    card: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#333',
    },
    alert: {
        backgroundColor: '#f8d7da',
        padding: 10,
        borderRadius: 5,
        marginBottom: 15,
    },
    alertText: {
        color: '#721c24',
        textAlign: 'center',
    },
    label: {
        marginBottom: 5,
        color: '#555',
        fontWeight: '500',
    },
    input: {
        height: 40,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 15,
        backgroundColor: '#f9f9f9',
    },
    primaryButton: {
        backgroundColor: '#007bff',
        padding: 12,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    linkButton: {
        alignItems: 'center',
        padding: 10,
    },
    linkText: {
        color: '#007bff',
        textDecorationLine: 'underline',
    },
    promoContainer: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    promoTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 10,
    },
    promoText: {
        fontSize: 16,
        color: 'white',
        textAlign: 'center',
        marginBottom: 15,
    },
    secondaryButton: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 5,
        width: '80%',
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: '#333',
        fontWeight: 'bold',
    },
});

export default Login;