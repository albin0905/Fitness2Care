import React, { useEffect, useState } from 'react';
import { ExerciseService } from '../../_components/services/ExerciseService';
import {IExercise} from "../../_common/models/IExercise";

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


    return (
        <div>
            <h2>Alle Exercises</h2>
            <ul>
                {exercises.map((exercise) => (
                    <li key={exercise.exerciseId}>
                        <h3>{exercise.exerciseName}</h3>
                        <p>Level: {exercise.exerciseLevel}</p>
                        <p>Body Part: {exercise.bodyPart}</p>
                        <p>Kcal: {exercise.kcal}</p>
                        <p>Beschreibung: {exercise.description}</p>
                        <img src={exercise.imageURL} alt={exercise.exerciseName} width="150" />
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Exercise;
