import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ScrollView } from 'react-native';
import { ExerciseService } from '../../../../frontend/src/_components/services/ExerciseService';
import { IExercise } from '../../../../frontend/src/_common/models/IExercise';

const Exercise = () => {
    const [exercises, setExercises] = useState<IExercise[]>([]);

    const loadExercises = async () => {
        try {
            const data = await ExerciseService.getAllExercises();
            setExercises(data);
        } catch (err) {
            console.error("Error loading exercises:", err);
        }
    };

    useEffect(() => {
        loadExercises();
    }, []);

    const renderExerciseItem = ({ item }: { item: IExercise }) => (
        <View style={styles.exerciseItem}>
            <Text style={styles.exerciseName}>{item.exerciseName}</Text>
            <Text>Level: {item.exerciseLevel}</Text>
            <Text>Body Part: {item.bodyPart}</Text>
            <Text>Kcal: {item.kcal}</Text>
            <Text>Beschreibung: {item.description}</Text>
            <Image
                source={{ uri: item.imageURL }}
                style={styles.exerciseImage}
                resizeMode="contain"
            />
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Alle Exercises</Text>
            <FlatList
                data={exercises}
                renderItem={renderExerciseItem}
                keyExtractor={(item) => item.exerciseId.toString()}
                scrollEnabled={false} // Da wir bereits in einem ScrollView sind
            />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    exerciseItem: {
        backgroundColor: '#f8f9fa',
        padding: 16,
        marginBottom: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#dee2e6',
    },
    exerciseName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    exerciseImage: {
        width: '100%',
        height: 200,
        marginTop: 10,
        borderRadius: 8,
    },
});

export default Exercise;