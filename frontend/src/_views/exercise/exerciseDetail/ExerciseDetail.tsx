import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

interface IExercise {
    exerciseId: number;
    exerciseName: string;
    exerciceLevel: string;
    bodyPart: string;
    imageURL: string;
}

const ExerciseDetail = () => {
    const { id } = useParams<{ id: string }>();
    const [exercise, setExercise] = useState<IExercise | null>(null);

    useEffect(() => {
        if (id) {
            axios.get(`http://localhost:8080/exercise/${id}`)
                .then(res => setExercise(res.data))
                .catch(err => console.error('Fehler beim Laden der Details:', err));
        }
    }, [id]);

    if (!exercise) return <div className="container mt-4">Lade Übung...</div>;

    return (
        <div className="container mt-4">
            <h2>Exercise Detail</h2>
            <div className="card p-3">
                <h3>{exercise.exerciseName}</h3>
                <p><strong>Level:</strong> {exercise.exerciceLevel}</p>
                <p><strong>Body Part:</strong> {exercise.bodyPart}</p>
                <img src={exercise.imageURL} alt={exercise.exerciseName} className="img-fluid" />
            </div>
            <Link to="/" className="btn btn-secondary mt-3">Zurück</Link>
        </div>
    );
};

export default ExerciseDetail;
