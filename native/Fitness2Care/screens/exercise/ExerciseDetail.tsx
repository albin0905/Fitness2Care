import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { ExerciseService } from '../../_components/services/ExerciseService';
import { IExercise } from '../../_common/models/IExercise';

type RootStackParamList = {
    ExerciseDetail: { id: string };
};

type ExerciseDetailRouteProp = RouteProp<RootStackParamList, 'ExerciseDetail'>;

const ExerciseDetail = () => {
    const route = useRoute<ExerciseDetailRouteProp>();
    const { id } = route.params;
    const [exercise, setExercise] = useState<IExercise | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchExercise = async () => {
        try {
            if (!id) {
                throw new Error('Exercise ID is missing');
            }
            setIsLoading(true);
            const exerciseData = await ExerciseService.getExerciseById(parseInt(id));
            setExercise(exerciseData);
        } catch (err) {
            console.error("Error loading exercise:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchExercise();
    }, [id]);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
                <Text>Lade Übung...</Text>
            </View>
        );
    }

    if (!exercise) {
        return (
            <View style={styles.container}>
                <Text>Übung nicht gefunden</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>{exercise.exerciseName}</Text>

            <View style={styles.detailRow}>
                <Text style={styles.label}>Level:</Text>
                <Text style={styles.value}>{exercise.exerciseLevel}</Text>
            </View>

            <View style={styles.detailRow}>
                <Text style={styles.label}>Body Part:</Text>
                <Text style={styles.value}>{exercise.bodyPart}</Text>
            </View>

            <Image
                source={{ uri: exercise.imageURL }}
                style={styles.exerciseImage}
                resizeMode="contain"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    label: {
        fontWeight: 'bold',
        width: 100,
    },
    value: {
        flex: 1,
    },
    exerciseImage: {
        width: '100%',
        height: 300,
        marginTop: 20,
        borderRadius: 10,
    },
});

export default ExerciseDetail;