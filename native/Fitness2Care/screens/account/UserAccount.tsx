import React, { useState } from "react";
import { useMemberContext } from "../../../../frontend/src/_common/context/MemberContext";
import axios from "axios";
import { MaterialIcons } from "@expo/vector-icons";
import { UserService } from "../../../../frontend/src/_components/services/UserService";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView
} from "react-native";

const UserAccount = () => {
    const { member, setMember } = useMemberContext();

    const [formData, setFormData] = useState({
        firstName: member?.firstName || "",
        lastName: member?.lastName || "",
        email: member?.email || "",
        phone: member?.phone?.toString() || "",
        weight: member?.weight?.toString() || "",
        password: member?.password || "",
    });

    const handleChange = (name: string, value: string) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleSave = async () => {
        if (!member) return;

        try {
            const updatedMember = await UserService.updateMember(
                member.memberId,
                {
                    ...formData,
                    phone: Number(formData.phone),
                    weight: Number(formData.weight)
                }
            );
            setMember(updatedMember);
            Alert.alert("Erfolg", "Daten erfolgreich gespeichert!");
        } catch (error) {
            Alert.alert("Fehler", "Fehler beim Speichern: " + (error as Error).message);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.header}>Benutzereinstellungen</Text>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Vorname</Text>
                <TextInput
                    style={styles.input}
                    value={formData.firstName}
                    onChangeText={(text) => handleChange("firstName", text)}
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Nachname</Text>
                <TextInput
                    style={styles.input}
                    value={formData.lastName}
                    onChangeText={(text) => handleChange("lastName", text)}
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>E-Mail</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="email-address"
                    value={formData.email}
                    onChangeText={(text) => handleChange("email", text)}
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Telefon</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="phone-pad"
                    value={formData.phone}
                    onChangeText={(text) => handleChange("phone", text)}
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Gewicht</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={formData.weight}
                    onChangeText={(text) => handleChange("weight", text)}
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Passwort ändern</Text>
                <TextInput
                    style={styles.input}
                    secureTextEntry
                    value={formData.password}
                    onChangeText={(text) => handleChange("password", text)}
                />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleSave}>
                <MaterialIcons name="save" size={20} color="white" />
                <Text style={styles.buttonText}> Speichern</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#fff'
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20
    },
    inputContainer: {
        marginBottom: 16
    },
    label: {
        marginBottom: 8,
        fontSize: 16
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 4,
        paddingHorizontal: 10
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#28a745',
        padding: 10,
        borderRadius: 4,
        marginTop: 10
    },
    buttonText: {
        color: 'white',
        marginLeft: 5
    }
});

export default UserAccount;