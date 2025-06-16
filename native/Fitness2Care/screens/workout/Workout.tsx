import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    FlatList
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { WorkoutService } from '../../_components/services/WorkoutService';
import { IWorkout } from '../../_common/models/IWorkout';

type RootStackParamList = {
    WorkoutDetails: { workoutId: number };
    ManageWorkout: { workoutId?: number };
};

type WorkoutNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Workout = () => {
    const [workouts, setWorkouts] = useState<IWorkout[]>([]);
    const navigation = useNavigation<WorkoutNavigationProp>();

    const fetchWorkouts = async () => {
        try {
            const data = await WorkoutService.getAllWorkouts();
            setWorkouts(data);
        } catch (error) {
            console.error('Fehler beim Laden der Workouts:', error);
            Alert.alert('Fehler', 'Workouts konnten nicht geladen werden');
        }
    };

    useEffect(() => {
        fetchWorkouts();
    }, []);

    const handleDelete = async (workoutId: number) => {
        Alert.alert(
            "Workout löschen",
            "Willst du dieses Workout wirklich löschen?",
            [
                {
                    text: "Abbrechen",
                    style: "cancel"
                },
                {
                    text: "Löschen",
                    onPress: async () => {
                        try {
                            await WorkoutService.deleteWorkout(workoutId);
                            setWorkouts(workouts.filter(w => w.workoutId !== workoutId));
                            Alert.alert("Erfolg", "Workout gelöscht!");
                        } catch (error) {
                            console.error("Fehler beim Löschen:", error);
                            Alert.alert("Fehler", "Löschen fehlgeschlagen");
                        }
                    }
                }
            ]
        );
    };

    const renderWorkoutItem = ({ item }: { item: IWorkout }) => (
        <TouchableOpacity
            style={styles.workoutItem}
            onPress={() => navigation.navigate('WorkoutDetails', { workoutId: item.workoutId })}
        >
            <View style={styles.workoutInfo}>
                <Text style={styles.workoutName}>{item.workoutName}</Text>
                <Text>{item.time} Minuten</Text>
                <Text>{WorkoutService.calculateTotalCalories(item.exercises)} kcal</Text>
                <Text numberOfLines={1} ellipsizeMode="tail">{item.description}</Text>
            </View>

            <View style={styles.workoutActions}>
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={(e) => {
                        e.stopPropagation();
                        navigation.navigate('ManageWorkout', { workoutId: item.workoutId });
                    }}
                >
                    <Icon name="edit" size={20} color="#007AFF" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={(e) => {
                        e.stopPropagation();
                        handleDelete(item.workoutId);
                    }}
                >
                    <Icon name="delete" size={20} color="#FF3B30" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Workouts</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate('ManageWorkout', {})}
                >
                    <Icon name="add" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={workouts}
                renderItem={renderWorkoutItem}
                keyExtractor={item => item.workoutId.toString()}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>Keine Workouts gefunden</Text>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    addButton: {
        backgroundColor: '#28a745',
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingBottom: 20,
    },
    workoutItem: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    workoutInfo: {
        flex: 1,
    },
    workoutName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    workoutActions: {
        flexDirection: 'row',
        marginLeft: 10,
    },
    editButton: {
        marginRight: 10,
        padding: 8,
    },
    deleteButton: {
        padding: 8,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#666',
    },
});

export default Workout;