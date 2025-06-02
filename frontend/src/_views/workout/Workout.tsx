import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Workout = () => {
    const [workouts, setWorkouts] = useState<IWorkout[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://localhost:8080/workout/workouts')
            .then((res) => {
                setWorkouts(res.data);
            })
            .catch((err) => {
                console.error('Fehler beim Laden der Workouts:', err);
            });
    }, []);

    // Funktion zur Berechnung der Gesamtkalorien eines Workouts
    const calculateTotalCalories = (exercises: IExercise[] = []) => {
        return exercises.reduce((sum, ex) => sum + (ex.kcal || 0), 0);
    };

    return (
        <div className="container p-4">
            <h2 className="mb-4">Workouts</h2>
            <table className="table table-hover">
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Dauer (Minuten)</th>
                    <th>Kalorien</th>
                    <th>Beschreibung</th>
                </tr>
                </thead>
                <tbody>
                {workouts.map((workout:IWorkout) => (
                    <tr
                        key={workout.workoutId}
                        onClick={() => navigate(`/workout/details/id/${workout.workoutId}`)}
                        style={{ cursor: 'pointer' }}
                    >
                        <td>{workout.workoutName}</td>
                        <td>{workout.time}</td>
                        <td>{calculateTotalCalories(workout.exercises)} kcal</td>
                        <td>{workout.description}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default Workout;