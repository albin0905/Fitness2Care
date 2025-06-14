import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    TextInput,
    Alert,
    FlatList,
    SectionList
} from 'react-native';
import { useMemberContext } from '../../../../frontend/src/_common/context/MemberContext';
import { GoalService } from '../../../../frontend/src/_components/services/GoalService';
import { IGoal } from '../../../../frontend/src/_common/models/IGoal';
import { IWorkout } from '../../../../frontend/src/_common/models/IWorkout';
import { IExercise } from '../../../../frontend/src/_common/models/IExercise';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

const Goal = () => {
    const { member } = useMemberContext();
    const [goals, setGoals] = useState<IGoal[]>([]);
    const [selectedGoal, setSelectedGoal] = useState<IGoal | null>(null);
    const [showWorkoutSelection, setShowWorkoutSelection] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [workouts, setWorkouts] = useState<IWorkout[]>([]);
    const [newGoal, setNewGoal] = useState({ goalName: "", kcal: 0, date: "" });
    const [editGoal, setEditGoal] = useState<IGoal | null>(null);

    const fetchData = async () => {
        if (member) {
            try {
                const [goalsRes, workoutsRes] = await Promise.all([
                    GoalService.getGoalsByMemberId(member.memberId),
                    GoalService.getAllWorkouts()
                ]);
                setGoals(goalsRes);
                setWorkouts(workoutsRes);
            } catch (err) {
                console.error(err);
            }
        }
    };

    useEffect(() => {
        fetchData();
    }, [member]);

    const handleSelectWorkout = async (workout: IWorkout) => {
        if (!selectedGoal || !member) return;

        try {
            const updatedGoal = await GoalService.addWorkoutToGoal(
                selectedGoal.goalId,
                workout.workoutId
            );
            setSelectedGoal(updatedGoal);
            fetchData();
            setShowWorkoutSelection(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handleRemoveWorkout = async (workoutId: number) => {
        if (!selectedGoal) return;

        try {
            const updatedGoal = await GoalService.removeWorkoutFromGoal(
                selectedGoal.goalId,
                workoutId
            );
            setSelectedGoal(updatedGoal);
            fetchData();
        } catch (err) {
            console.error("Error removing workout:", err);
        }
    };

    const handleCreateNewGoal = async () => {
        if (!member) return;

        try {
            const createdGoal = await GoalService.createGoal(
                {
                    goalName: newGoal.goalName,
                    kcal: newGoal.kcal,
                    date: newGoal.date
                },
                member.memberId
            );
            setGoals(prev => [...prev, createdGoal]);
            setShowModal(false);
            setNewGoal({ goalName: "", kcal: 0, date: "" });
        } catch (err) {
            console.error("Error creating goal:", err);
        }
    };

    const handleEditGoal = async () => {
        if (!editGoal) return;

        try {
            const updatedGoal = await GoalService.updateGoal(editGoal);
            setGoals(goals.map(goal =>
                goal.goalId === editGoal.goalId ? updatedGoal : goal
            ));

            if (selectedGoal?.goalId === editGoal.goalId) {
                setSelectedGoal(updatedGoal);
            }

            setShowEditModal(false);
            setEditGoal(null);
        } catch (err) {
            console.error("Error updating goal:", err);
        }
    };

    const handleDeleteGoal = async (goalId: number) => {
        Alert.alert(
            "Ziel löschen",
            "Möchten Sie dieses Ziel wirklich löschen?",
            [
                {
                    text: "Abbrechen",
                    style: "cancel"
                },
                {
                    text: "Löschen",
                    onPress: async () => {
                        try {
                            await GoalService.deleteGoal(goalId);
                            setGoals(goals.filter(goal => goal.goalId !== goalId));
                            if (selectedGoal?.goalId === goalId) {
                                setSelectedGoal(null);
                            }
                        } catch (err) {
                            console.error("Error deleting goal:", err);
                        }
                    }
                }
            ]
        );
    };

    const calculateTotalCalories = (exercises: IExercise[] = []) =>
        exercises.reduce((sum, ex) => sum + (ex.kcal || 0), 0);

    const getWorkoutMinutesData = () => {
        if (!selectedGoal || !selectedGoal.workouts || selectedGoal.workouts.length === 0) {
            return null;
        }

        const workoutsByDate: Record<string, number> = {};
        selectedGoal.workouts.forEach(workout => {
            const date = new Date(workout.time).toLocaleDateString();
            if (!workoutsByDate[date]) {
                workoutsByDate[date] = 0;
            }
            workoutsByDate[date] += workout.time || 0;
        });

        return {
            labels: Object.keys(workoutsByDate),
            datasets: [{
                data: Object.values(workoutsByDate)
            }]
        };
    };

    const workoutMinutesData = getWorkoutMinutesData();

    if (!member) {
        return (
            <View style={styles.container}>
                <Text>Bitte zuerst einloggen.</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Meine Ziele</Text>

            <View style={styles.row}>
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardHeaderText}>Meine Ziele</Text>
                        <TouchableOpacity
                            onPress={() => setShowModal(true)}
                            style={styles.addButton}
                        >
                            <Icon name="add" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.cardBody}>
                        {goals.length === 0 ? (
                            <Text>Keine Ziele gefunden.</Text>
                        ) : (
                            <FlatList
                                data={goals}
                                keyExtractor={item => item.goalId.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[
                                            styles.goalItem,
                                            selectedGoal?.goalId === item.goalId && styles.selectedGoalItem
                                        ]}
                                        onPress={() => {
                                            setSelectedGoal(item);
                                            setShowWorkoutSelection(false);
                                        }}
                                    >
                                        <View style={styles.goalContent}>
                                            <Text style={styles.goalName}>{item.goalName}</Text>
                                            <Text>Datum: {new Date(item.date).toLocaleDateString()}</Text>
                                            <Text>Kalorienziel: {item.kcal} kcal</Text>
                                        </View>
                                        <View style={styles.goalActions}>
                                            <TouchableOpacity
                                                onPress={(e) => {
                                                    e.stopPropagation();
                                                    setEditGoal(item);
                                                    setShowEditModal(true);
                                                }}
                                                style={styles.editButton}
                                            >
                                                <Icon name="edit" size={20} color="white" />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteGoal(item.goalId);
                                                }}
                                                style={styles.deleteButton}
                                            >
                                                <Icon name="delete" size={20} color="white" />
                                            </TouchableOpacity>
                                        </View>
                                    </TouchableOpacity>
                                )}
                            />
                        )}
                    </View>
                </View>

                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardHeaderText}>
                            {selectedGoal ? `Workouts für ${selectedGoal.goalName}` : "Workouts auswählen"}
                        </Text>
                    </View>
                    <View style={styles.cardBody}>
                        {selectedGoal ? (
                            <>
                                <Text style={styles.subHeader}>Zugeordnete Workouts:</Text>
                                {selectedGoal.workouts?.length > 0 ? (
                                    <>
                                        <FlatList
                                            data={selectedGoal.workouts}
                                            keyExtractor={item => item.workoutId.toString()}
                                            renderItem={({ item }) => (
                                                <View style={styles.workoutItem}>
                                                    <View style={styles.workoutInfo}>
                                                        <Text style={styles.workoutName}>{item.workoutName}</Text>
                                                        <Text>{item.time} Minuten</Text>
                                                        <Text>{calculateTotalCalories(item.exercises)} kcal</Text>
                                                    </View>
                                                    <TouchableOpacity
                                                        onPress={() => handleRemoveWorkout(item.workoutId)}
                                                        style={styles.removeButton}
                                                    >
                                                        <Icon name="delete" size={20} color="white" />
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                        />

                                        <View style={styles.chartContainer}>
                                            <Text style={styles.subHeader}>Workout-Statistik</Text>
                                            {workoutMinutesData ? (
                                                <BarChart
                                                    data={{
                                                        labels: workoutMinutesData.labels,
                                                        datasets: workoutMinutesData.datasets,
                                                    }}
                                                    width={screenWidth - 40}
                                                    height={220}
                                                    yAxisLabel=""
                                                    yAxisSuffix=""
                                                    chartConfig={{
                                                        backgroundColor: '#ffffff',
                                                        backgroundGradientFrom: '#ffffff',
                                                        backgroundGradientTo: '#ffffff',
                                                        decimalPlaces: 0,
                                                        color: (opacity = 1) => `rgba(75, 192, 192, ${opacity})`,
                                                        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                                    }}
                                                    style={styles.chart}
                                                />
                                            ) : (
                                                <Text>Keine Daten für das Diagramm verfügbar.</Text>
                                            )}
                                        </View>
                                    </>
                                ) : (
                                    <Text>Keine Workouts zugeordnet.</Text>
                                )}
                                <TouchableOpacity
                                    style={styles.selectWorkoutButton}
                                    onPress={() => setShowWorkoutSelection(true)}
                                >
                                    <Text style={styles.selectWorkoutButtonText}>Workout auswählen</Text>
                                </TouchableOpacity>
                                {showWorkoutSelection && (
                                    <>
                                        <Text style={styles.subHeader}>Verfügbare Workouts:</Text>
                                        <FlatList
                                            data={workouts}
                                            keyExtractor={item => item.workoutId.toString()}
                                            renderItem={({ item }) => (
                                                <TouchableOpacity
                                                    style={styles.availableWorkoutItem}
                                                    onPress={() => handleSelectWorkout(item)}
                                                >
                                                    <Text style={styles.workoutName}>{item.workoutName}</Text>
                                                    <Text>{item.time} Minuten</Text>
                                                </TouchableOpacity>
                                            )}
                                        />
                                    </>
                                )}
                            </>
                        ) : (
                            <Text>Bitte ein Ziel auswählen.</Text>
                        )}
                    </View>
                </View>
            </View>

            {/* New Goal Modal */}
            <Modal
                visible={showModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Neues Ziel erstellen</Text>
                            <TouchableOpacity onPress={() => setShowModal(false)}>
                                <Icon name="close" size={24} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.modalBody}>
                            <Text style={styles.inputLabel}>Zielname</Text>
                            <TextInput
                                style={styles.input}
                                value={newGoal.goalName}
                                onChangeText={text => setNewGoal(prev => ({ ...prev, goalName: text }))}
                                placeholder="Zielname eingeben"
                            />

                            <Text style={styles.inputLabel}>Kalorienziel</Text>
                            <TextInput
                                style={styles.input}
                                value={newGoal.kcal.toString()}
                                onChangeText={text => setNewGoal(prev => ({ ...prev, kcal: parseInt(text) || 0 }))}
                                keyboardType="numeric"
                                placeholder="Kalorienziel eingeben"
                            />

                            <Text style={styles.inputLabel}>Datum</Text>
                            <TextInput
                                style={styles.input}
                                value={newGoal.date}
                                onChangeText={text => setNewGoal(prev => ({ ...prev, date: text }))}
                                placeholder="YYYY-MM-DD"
                            />
                        </View>
                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setShowModal(false)}
                            >
                                <Icon name="cancel" size={20} color="white" />
                                <Text style={styles.buttonText}>Abbrechen</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton]}
                                onPress={handleCreateNewGoal}
                            >
                                <Icon name="save" size={20} color="white" />
                                <Text style={styles.buttonText}>Speichern</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Edit Goal Modal */}
            <Modal
                visible={showEditModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowEditModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Ziel bearbeiten</Text>
                            <TouchableOpacity onPress={() => setShowEditModal(false)}>
                                <Icon name="close" size={24} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.modalBody}>
                            <Text style={styles.inputLabel}>Zielname</Text>
                            <TextInput
                                style={styles.input}
                                value={editGoal?.goalName || ''}
                                onChangeText={text => editGoal && setEditGoal({...editGoal, goalName: text})}
                                placeholder="Zielname eingeben"
                            />

                            <Text style={styles.inputLabel}>Kalorienziel</Text>
                            <TextInput
                                style={styles.input}
                                value={editGoal?.kcal.toString() || '0'}
                                onChangeText={text => editGoal && setEditGoal({...editGoal, kcal: parseInt(text) || 0})}
                                keyboardType="numeric"
                                placeholder="Kalorienziel eingeben"
                            />

                            <Text style={styles.inputLabel}>Datum</Text>
                            <TextInput
                                style={styles.input}
                                value={editGoal?.date.toString() || ''}
                                onChangeText={text => editGoal && setEditGoal({...editGoal, date: text})}
                                placeholder="YYYY-MM-DD"
                            />
                        </View>
                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setShowEditModal(false)}
                            >
                                <Icon name="cancel" size={20} color="white" />
                                <Text style={styles.buttonText}>Abbrechen</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton]}
                                onPress={handleEditGoal}
                            >
                                <Icon name="save" size={20} color="white" />
                                <Text style={styles.buttonText}>Speichern</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    row: {
        flexDirection: 'column',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 8,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        backgroundColor: '#007bff',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardHeaderText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    addButton: {
        backgroundColor: '#28a745',
        borderRadius: 20,
        padding: 4,
    },
    cardBody: {
        padding: 16,
    },
    goalItem: {
        backgroundColor: '#f8f9fa',
        padding: 12,
        marginBottom: 8,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#dee2e6',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    selectedGoalItem: {
        backgroundColor: '#e7f1ff',
        borderColor: '#007bff',
    },
    goalContent: {
        flex: 1,
    },
    goalName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    goalActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    editButton: {
        backgroundColor: '#007bff',
        borderRadius: 4,
        padding: 6,
        marginRight: 8,
    },
    deleteButton: {
        backgroundColor: '#dc3545',
        borderRadius: 4,
        padding: 6,
    },
    subHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    workoutItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    workoutInfo: {
        flex: 1,
    },
    workoutName: {
        fontWeight: 'bold',
    },
    removeButton: {
        backgroundColor: '#dc3545',
        borderRadius: 4,
        padding: 6,
    },
    chartContainer: {
        marginTop: 20,
    },
    chart: {
        borderRadius: 8,
    },
    selectWorkoutButton: {
        backgroundColor: '#6c757d',
        padding: 10,
        borderRadius: 4,
        marginTop: 16,
        alignItems: 'center',
    },
    selectWorkoutButtonText: {
        color: 'white',
    },
    availableWorkoutItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 8,
        width: '90%',
        maxWidth: 400,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalBody: {
        padding: 16,
    },
    inputLabel: {
        marginBottom: 8,
        fontWeight: 'bold',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        padding: 10,
        marginBottom: 16,
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    modalButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 4,
        marginLeft: 8,
    },
    cancelButton: {
        backgroundColor: '#dc3545',
    },
    saveButton: {
        backgroundColor: '#28a745',
    },
    buttonText: {
        color: 'white',
        marginLeft: 5,
    },
});

export default Goal;