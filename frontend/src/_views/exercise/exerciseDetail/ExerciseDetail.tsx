import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {ExerciseService} from "../../../_components/services/ExerciseService";

const ExerciseDetail = () => {
    const { id } = useParams();
    const [exercise, setExercise] = useState<IExercise | null>(null);

    const fetchExercise = async () => {
        try {
            if (!id) {
                throw new Error('Exercise ID is missing');
            }
            const exerciseData = await ExerciseService.getExerciseById(parseInt(id));
            setExercise(exerciseData);
        } catch (err) {
            console.error("Error loading exercise:", err);
        }
    };

    useEffect(() => {
        fetchExercise();
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
