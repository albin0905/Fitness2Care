import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface IExercise {
    exerciseId: number;
    exerciseName: string;
    exerciseLevel: string;
    bodyPart: string;
    imageURL: string;
}

const ExerciseDetail = () => {
    const { id } = useParams();
    const [exercise, setExercise] = useState<IExercise | null>(null);

    useEffect(() => {
        axios.get(`http://localhost:8080/exercise/${id}`)
            .then(res => setExercise(res.data))
            .catch(err => console.error("Fehler beim Laden:", err));
    }, [id]);

    if (!exercise) return <p>Lade Übung...</p>;

    return (
        <div className="container mt-4">
            <h2>{exercise.exerciseName}</h2>
            <p><strong>Level:</strong> {exercise.exerciseLevel}</p>
            <p><strong>Body Part:</strong> {exercise.bodyPart}</p>
            <img
                src={exercise.imageURL}
                alt={exercise.exerciseName}
                className="img-fluid rounded"
                style={{ maxWidth: '600px' }}
            />
        </div>
    );
};

export default ExerciseDetail;
