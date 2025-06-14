import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    TextInput,
    Image,
    FlatList,
    Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ExerciseService } from '../../../../frontend/src/_components/services/ExerciseService';
import { WorkoutService } from '../../../../frontend/src/_components/services/WorkoutService';
import { IExercise } from '../../../../frontend/src/_common/models/IExercise';
import { IWorkout } from '../../../../frontend/src/_common/models/IWorkout';

const WorkoutDetail = () => {
    const route = useRoute();
    const { workoutId } = route.params as { workoutId: string };
    const navigation = useNavigation();
    const [workout, setWorkout] = useState<IWorkout | null>(null);
    const [allExercises, setAllExercises] = useState<IExercise[]>([]);
    const [editMode, setEditMode] = useState(false);
    const [selectedExercises, setSelectedExercises] = useState<number[]>([]);
    const [showExerciseModal, setShowExerciseModal] = useState(false);
    const [currentExercise, setCurrentExercise] = useState<IExercise | null>(null);
    const [newExercise, setNewExercise] = useState<Omit<IExercise, 'exerciseId'>>({
        exerciseName: '',
        bodyPart: '',
        imageURL: '',
        exerciseLevel: '',
        description: '',
        kcal: 0
    });
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailExercise, setDetailExercise] = useState<IExercise | null>(null);

    const [isLevelDropdownOpen, setIsLevelDropdownOpen] = useState(false);
    const levelOptions = [
        { label: "Easy", value: "EASY" },
        { label: "Medium", value: "MEDIUM" },
        { label: "Hard", value: "HARD" },
    ];

    const calculateTotalCalories = () => {
        if (!allExercises.length) return 0;
        return allExercises
            .filter(ex => selectedExercises.includes(ex.exerciseId))
            .reduce((sum, ex) => sum + (ex.kcal || 0), 0);
    };

    const fetchData = async () => {
        try {
            const workoutData = await WorkoutService.getWorkoutDetails(Number(workoutId));
            setWorkout(workoutData);

            if (workoutData?.exercises) {
                setSelectedExercises(workoutData.exercises.map((ex: IExercise) => ex.exerciseId));
            }

            const exercisesData = await ExerciseService.getAllExercises();
            setAllExercises(exercisesData);
        } catch (error) {
            console.error('Error loading data:', error);
            Alert.alert('Error', 'Failed to load data');
        }
    };

    useEffect(() => {
        fetchData();
    }, [workoutId]);

    const toggleEditMode = () => {
        setEditMode(!editMode);
        if (editMode && workout?.exercises) {
            setSelectedExercises(workout.exercises.map((ex: IExercise) => ex.exerciseId));
        }
    };

    const toggleExerciseSelection = (exerciseId: number) => {
        setSelectedExercises(prev =>
            prev.includes(exerciseId)
                ? prev.filter(id => id !== exerciseId)
                : [...prev, exerciseId]
        );
    };

    const saveChanges = async () => {
        if (!workout) return;

        try {
            const updatedExercises = allExercises.filter((ex: IExercise) =>
                selectedExercises.includes(ex.exerciseId)
            );

            const updatedWorkout = {
                ...workout,
                exercises: updatedExercises
            };

            await WorkoutService.updateWorkout(workout.workoutId, updatedWorkout);
            setWorkout(updatedWorkout);
            setEditMode(false);
            Alert.alert('Success', 'Workout updated successfully');
        } catch (error) {
            console.error('Error saving changes:', error);
            Alert.alert('Error', 'Failed to save changes');
        }
    };

    const handleAddNewExercise = async () => {
        try {
            const createdExercise = await ExerciseService.createExercise(newExercise);

            setSelectedExercises([...selectedExercises, createdExercise.exerciseId]);
            const exercisesData = await ExerciseService.getAllExercises();
            setAllExercises(exercisesData);

            setNewExercise({ exerciseName: '', exerciseLevel: '', bodyPart: '', imageURL: '', kcal: 0, description: '' });
            setShowExerciseModal(false);
            Alert.alert('Success', 'Exercise added successfully');
        } catch (error) {
            console.error('Error adding exercise:', error);
            Alert.alert('Error', 'Failed to add exercise');
        }
    };

    const handleUpdateExercise = async () => {
        if (!currentExercise) return;

        try {
            await ExerciseService.updateExercise(currentExercise.exerciseId, currentExercise);
            const exercisesData = await ExerciseService.getAllExercises();
            setAllExercises(exercisesData);

            setCurrentExercise(null);
            setShowExerciseModal(false);
            Alert.alert('Success', 'Exercise updated successfully');
        } catch (error) {
            console.error('Error updating exercise:', error);
            Alert.alert('Error', 'Failed to update exercise');
        }
    };

    const handleDeleteExercise = async (exerciseId: number) => {
        Alert.alert(
            'Delete Exercise',
            'Are you sure you want to delete this exercise?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Delete',
                    onPress: async () => {
                        try {
                            await ExerciseService.deleteExercise(exerciseId);
                            setSelectedExercises(selectedExercises.filter(id => id !== exerciseId));
                            const exercisesData = await ExerciseService.getAllExercises();
                            setAllExercises(exercisesData);
                            Alert.alert('Success', 'Exercise deleted successfully');
                        } catch (error) {
                            console.error('Error deleting exercise:', error);
                            Alert.alert('Error', 'Failed to delete exercise');
                        }
                    }
                }
            ]
        );
    };

    const isExerciseInWorkout = (exerciseId: number): boolean => {
        if (!workout) return false;
        return workout.exercises?.some((ex: IExercise) => ex.exerciseId === exerciseId) ?? false;
    };

    const isExerciseSelected = (exerciseId: number): boolean => {
        return selectedExercises.includes(exerciseId);
    };

    const handleShowExerciseDetail = (exercise: IExercise) => {
        setDetailExercise(exercise);
        setShowDetailModal(true);
    };

    const closeDetailModal = () => {
        setShowDetailModal(false);
        setDetailExercise(null);
    };

    const handleSelectLevel = (value: string) => {
        if (currentExercise) {
            setCurrentExercise({ ...currentExercise, exerciseLevel: value });
        } else {
            setNewExercise({ ...newExercise, exerciseLevel: value });
        }
        setIsLevelDropdownOpen(false);
    };

    const renderExerciseItem = ({ item }: { item: IExercise }) => (
        <TouchableOpacity
            style={[
                styles.exerciseItem,
                !editMode && isExerciseInWorkout(item.exerciseId) && styles.selectedExercise
            ]}
            onPress={() => !editMode && handleShowExerciseDetail(item)}
        >
            <View style={styles.exerciseCheckbox}>
                {editMode ? (
                    <TouchableOpacity
                        onPress={() => toggleExerciseSelection(item.exerciseId)}
                        style={[
                            styles.checkbox,
                            isExerciseSelected(item.exerciseId) && styles.checkboxSelected
                        ]}
                    />
                ) : (
                    <View style={[
                        styles.checkbox,
                        isExerciseInWorkout(item.exerciseId) && styles.checkboxSelected
                    ]} />
                )}
            </View>

            <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{item.exerciseName}</Text>
                <Text>{item.bodyPart}</Text>
                <Text>{item.exerciseLevel}</Text>
                <Text>{item.kcal} kcal</Text>
            </View>

            <View style={styles.exerciseActions}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                        setCurrentExercise(item);
                        setShowExerciseModal(true);
                    }}
                >
                    <Icon name="edit" size={20} color="#007AFF" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteExercise(item.exerciseId)}
                >
                    <Icon name="delete" size={20} color="#FF3B30" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-back" size={24} color="#000" />
                    <Text style={styles.backText}>All Workouts</Text>
                </TouchableOpacity>

                <Text style={styles.title}>{workout?.workoutName} - Details</Text>

                <View style={styles.headerActions}>
                    {!editMode ? (
                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={toggleEditMode}
                        >
                            <Icon name="edit" size={20} color="#007AFF" />
                        </TouchableOpacity>
                    ) : (
                        <>
                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={saveChanges}
                            >
                                <Icon name="save" size={20} color="#34C759" />
                                <Text style={styles.buttonText}>Save</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={toggleEditMode}
                            >
                                <Icon name="cancel" size={20} color="#FF3B30" />
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                        </>
                    )}
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => {
                            setCurrentExercise(null);
                            setShowExerciseModal(true);
                        }}
                    >
                        <Icon name="add" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </View>

            {editMode && (
                <View style={styles.caloriesContainer}>
                    <Text style={styles.caloriesText}>
                        Total Calories: <Text style={styles.caloriesValue}>{calculateTotalCalories()} kcal</Text>
                    </Text>
                </View>
            )}

            <FlatList
                data={allExercises}
                renderItem={renderExerciseItem}
                keyExtractor={item => item.exerciseId.toString()}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No exercises found</Text>
                }
            />

            <Modal
                visible={showExerciseModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowExerciseModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {currentExercise ? "Edit Exercise" : "Create New Exercise"}
                            </Text>
                            <TouchableOpacity onPress={() => setShowExerciseModal(false)}>
                                <Icon name="close" size={24} color="#000" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            <Text style={styles.inputLabel}>Exercise Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Exercise name"
                                value={currentExercise ? currentExercise.exerciseName : newExercise.exerciseName}
                                onChangeText={(text) => {
                                    if (currentExercise) {
                                        setCurrentExercise({
                                            ...currentExercise,
                                            exerciseName: text
                                        });
                                    } else {
                                        setNewExercise({
                                            ...newExercise,
                                            exerciseName: text
                                        });
                                    }
                                }}
                            />

                            <Text style={styles.inputLabel}>Difficulty Level</Text>
                            <TouchableOpacity
                                style={styles.dropdownButton}
                                onPress={() => setIsLevelDropdownOpen(true)}
                            >
                                <Text>
                                    {currentExercise?.exerciseLevel || newExercise.exerciseLevel
                                        ? levelOptions.find(opt => opt.value === (currentExercise?.exerciseLevel || newExercise.exerciseLevel))?.label
                                        : "Select difficulty"}
                                </Text>
                                <Icon name="arrow-drop-down" size={24} color="#666" />
                            </TouchableOpacity>

                            <Modal
                                visible={isLevelDropdownOpen}
                                transparent
                                animationType="fade"
                                onRequestClose={() => setIsLevelDropdownOpen(false)}
                            >
                                <TouchableOpacity
                                    style={styles.dropdownOverlay}
                                    activeOpacity={1}
                                    onPress={() => setIsLevelDropdownOpen(false)}
                                >
                                    <View style={styles.dropdownContainer}>
                                        {levelOptions.map((option) => (
                                            <TouchableOpacity
                                                key={option.value}
                                                style={[
                                                    styles.dropdownItem,
                                                    (currentExercise?.exerciseLevel === option.value ||
                                                        newExercise.exerciseLevel === option.value) && styles.selectedItem
                                                ]}
                                                onPress={() => handleSelectLevel(option.value)}
                                            >
                                                <Text style={styles.dropdownItemText}>{option.label}</Text>
                                                {(currentExercise?.exerciseLevel === option.value ||
                                                    newExercise.exerciseLevel === option.value) && (
                                                    <Icon name="check" size={18} color="#007AFF" />
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </TouchableOpacity>
                            </Modal>

                            <Text style={styles.inputLabel}>Body Part</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Body part"
                                value={currentExercise ? currentExercise.bodyPart : newExercise.bodyPart}
                                onChangeText={(text) => {
                                    if (currentExercise) {
                                        setCurrentExercise({
                                            ...currentExercise,
                                            bodyPart: text
                                        });
                                    } else {
                                        setNewExercise({
                                            ...newExercise,
                                            bodyPart: text
                                        });
                                    }
                                }}
                            />

                            <Text style={styles.inputLabel}>Image URL</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Image URL"
                                value={currentExercise ? currentExercise.imageURL : newExercise.imageURL}
                                onChangeText={(text) => {
                                    if (currentExercise) {
                                        setCurrentExercise({
                                            ...currentExercise,
                                            imageURL: text
                                        });
                                    } else {
                                        setNewExercise({
                                            ...newExercise,
                                            imageURL: text
                                        });
                                    }
                                }}
                            />

                            <Text style={styles.inputLabel}>Calories (kcal)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Calories"
                                keyboardType="numeric"
                                value={currentExercise ? currentExercise.kcal.toString() : newExercise.kcal.toString()}
                                onChangeText={(text) => {
                                    const kcalValue = parseInt(text) || 0;
                                    if (currentExercise) {
                                        setCurrentExercise({
                                            ...currentExercise,
                                            kcal: kcalValue
                                        });
                                    } else {
                                        setNewExercise({
                                            ...newExercise,
                                            kcal: kcalValue
                                        });
                                    }
                                }}
                            />

                            <Text style={styles.inputLabel}>Description</Text>
                            <TextInput
                                style={[styles.input, styles.multilineInput]}
                                placeholder="Description"
                                multiline
                                numberOfLines={4}
                                value={currentExercise ? currentExercise.description : newExercise.description}
                                onChangeText={(text) => {
                                    if (currentExercise) {
                                        setCurrentExercise({
                                            ...currentExercise,
                                            description: text
                                        });
                                    } else {
                                        setNewExercise({
                                            ...newExercise,
                                            description: text
                                        });
                                    }
                                }}
                            />
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelModalButton]}
                                onPress={() => {
                                    setShowExerciseModal(false);
                                    setCurrentExercise(null);
                                    setNewExercise({ exerciseName: '', exerciseLevel: '', bodyPart: '', imageURL: '', description: '', kcal: 0 });
                                }}
                            >
                                <Text style={styles.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.submitModalButton]}
                                onPress={currentExercise ? handleUpdateExercise : handleAddNewExercise}
                            >
                                <Text style={styles.modalButtonText}>
                                    {currentExercise ? "Update" : "Create"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal
                visible={showDetailModal}
                animationType="slide"
                transparent={true}
                onRequestClose={closeDetailModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, styles.detailModalContent]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Exercise Details</Text>
                            <TouchableOpacity onPress={closeDetailModal}>
                                <Icon name="close" size={24} color="#000" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            {detailExercise && (
                                <>
                                    <Text style={styles.detailTitle}>{detailExercise.exerciseName}</Text>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Level:</Text>
                                        <Text style={styles.detailValue}>{detailExercise.exerciseLevel}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Body Part:</Text>
                                        <Text style={styles.detailValue}>{detailExercise.bodyPart}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Calories:</Text>
                                        <Text style={styles.detailValue}>{detailExercise.kcal} kcal</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Description:</Text>
                                        <Text style={styles.detailValue}>{detailExercise.description}</Text>
                                    </View>
                                    {detailExercise.imageURL && (
                                        <Image
                                            source={{ uri: detailExercise.imageURL }}
                                            style={styles.exerciseImage}
                                            resizeMode="contain"
                                        />
                                    )}
                                </>
                            )}
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.closeModalButton]}
                                onPress={closeDetailModal}
                            >
                                <Text style={styles.modalButtonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backText: {
        marginLeft: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    editButton: {
        marginRight: 16,
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#34C759',
        padding: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    cancelButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF3B30',
        padding: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    addButton: {
        backgroundColor: '#007AFF',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        marginLeft: 8,
    },
    caloriesContainer: {
        padding: 16,
        backgroundColor: '#fff',
    },
    caloriesText: {
        fontSize: 16,
    },
    caloriesValue: {
        fontWeight: 'bold',
    },
    listContent: {
        padding: 16,
    },
    exerciseItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        alignItems: 'center',
    },
    selectedExercise: {
        backgroundColor: '#e6f7ff',
    },
    exerciseCheckbox: {
        marginRight: 16,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#007AFF',
    },
    checkboxSelected: {
        backgroundColor: '#007AFF',
    },
    exerciseInfo: {
        flex: 1,
    },
    exerciseName: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 4,
    },
    exerciseActions: {
        flexDirection: 'row',
    },
    actionButton: {
        marginLeft: 16,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 32,
        fontSize: 16,
        color: '#666',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 8,
        width: '90%',
        maxHeight: '80%',
    },
    detailModalContent: {
        width: '95%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
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
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        padding: 12,
        marginBottom: 16,
        backgroundColor: '#f9f9f9',
    },
    multilineInput: {
        height: 100,
        textAlignVertical: 'top',
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    },
    modalButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 4,
        marginLeft: 8,
    },
    cancelModalButton: {
        backgroundColor: '#FF3B30',
    },
    submitModalButton: {
        backgroundColor: '#007AFF',
    },
    closeModalButton: {
        backgroundColor: '#007AFF',
    },
    modalButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    detailTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    detailLabel: {
        fontWeight: 'bold',
        width: 100,
    },
    detailValue: {
        flex: 1,
    },
    exerciseImage: {
        width: '100%',
        height: 200,
        marginTop: 16,
        borderRadius: 8,
    },
    // New dropdown styles
    dropdownButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        marginBottom: 16,
        backgroundColor: '#f9f9f9',
    },
    dropdownOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    dropdownContainer: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 8,
        paddingVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 5,
    },
    dropdownItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    selectedItem: {
        backgroundColor: '#f0f8ff',
    },
    dropdownItemText: {
        fontSize: 16,
    },
});

export default WorkoutDetail;