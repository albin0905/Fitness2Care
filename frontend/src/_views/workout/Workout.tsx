import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface IWorkout {
    workoutId: number;
    workoutName: string;
    duration: number;
    kcal: number;
}

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

    return (
        <div className="container p-4">
            <h2 className="mb-4">Workouts</h2>
            <table className="table table-hover">
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Dauer (Minuten)</th>
                    <th>Kcal</th>
                </tr>
                </thead>
                <tbody>
                {workouts.map((workout) => (
                    <tr
                        key={workout.workoutId}
                        onClick={() => navigate(`/workout/${workout.workoutId}`)}
                        style={{ cursor: 'pointer' }}
                    >
                        <td>{workout.workoutName}</td>
                        <td>{workout.duration}</td>
                        <td>{workout.kcal}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default Workout;
