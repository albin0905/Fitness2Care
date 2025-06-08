import React, { useEffect, useState } from 'react';

const Exercise = () => {
    const [exercises, setExercises] = useState<IExercise[]>([]);

    useEffect(() => {
        fetch('http://localhost:8080/exercise/exercises')
            .then(res => res.json())
            .then(data => setExercises(data))
            .catch(err => console.error("Fehler beim Laden der Exercises:", err));
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
