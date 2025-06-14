import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    Keyboard
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';

interface WorkoutParams {
    workoutId?: string;
}

interface WorkoutState {
    workoutName: string;
    time: number;
    description: string;
}

const WorkoutManager = () => {
    const [workout, setWorkout] = useState<WorkoutState>({
        workoutName: "",
        time: 0,
        description: "",
    });

    const navigation = useNavigation();
    const route = useRoute();
    const { workoutId } = route.params as WorkoutParams;

    useEffect(() => {
        if (workoutId) {
            axios.get(`http://localhost:8080/workout/workout/details/id/${workoutId}`)
                .then(res => {
                    const data = res.data;
                    setWorkout({
                        workoutName: data.workoutName,
                        time: data.time,
                        description: data.description,
                    });
                })
                .catch(err => {
                    console.error("Fehler beim Laden des Workouts:", err);
                    Alert.alert("Fehler", "Workout konnte nicht geladen werden");
                });
        }
    }, [workoutId]);

    const handleSubmit = async () => {
        try {
            Keyboard.dismiss();
            const payload = {
                workoutName: workout.workoutName,
                time: workout.time,
                description: workout.description,
            };

            if (workoutId) {
                await axios.put(`http://localhost:8080/workout/${workoutId}`, payload, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                Alert.alert("Erfolg", "Workout aktualisiert!");
            } else {
                await axios.post("http://localhost:8080/workout/addWorkout", payload, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                Alert.alert("Erfolg", "Workout hinzugefügt!");
            }
            navigation.goBack();
        } catch (error) {
            console.error("Fehler beim Speichern des Workouts:", error);
            Alert.alert("Fehler", "Speichern fehlgeschlagen");
        }
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
        >
            <Text style={styles.title}>
                {workoutId ? "Workout bearbeiten" : "Workout hinzufügen"}
            </Text>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                    style={styles.input}
                    value={workout.workoutName}
                    onChangeText={(text) => setWorkout({ ...workout, workoutName: text })}
                    placeholder="Workout Name"
                    placeholderTextColor="#999"
                    returnKeyType="next"
                    onSubmitEditing={() => Keyboard.dismiss()}
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Dauer (Minuten)</Text>
                <TextInput
                    style={styles.input}
                    value={workout.time.toString()}
                    onChangeText={(text) => setWorkout({ ...workout, time: Number(text) || 0 })}
                    placeholder="0"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    returnKeyType="next"
                    onSubmitEditing={() => Keyboard.dismiss()}
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Beschreibung</Text>
                <TextInput
                    style={[styles.input, styles.multilineInput]}
                    value={workout.description}
                    onChangeText={(text) => setWorkout({ ...workout, description: text })}
                    placeholder="Beschreibung"
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={4}
                    returnKeyType="done"
                    onSubmitEditing={() => Keyboard.dismiss()}
                />
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, styles.saveButton]}
                    onPress={handleSubmit}
                >
                    <Icon name="add" size={20} color="white" />
                    <Text style={styles.buttonText}>
                        {workoutId ? "Aktualisieren" : "Erstellen"}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="cancel" size={20} color="white" />
                    <Text style={styles.buttonText}>Abbrechen</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    contentContainer: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        color: '#333',
        fontWeight: '500',
    },
    input: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    multilineInput: {
        height: 100,
        textAlignVertical: 'top',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        flex: 1,
        marginHorizontal: 5,
    },
    saveButton: {
        backgroundColor: '#28a745',
    },
    cancelButton: {
        backgroundColor: '#dc3545',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});

export default WorkoutManager;