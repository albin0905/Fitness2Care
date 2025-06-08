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

    const calculateTotalCalories = (exercises: IExercise[] = []) => {
        return exercises.reduce((sum, ex) => sum + (ex.kcal || 0), 0);
    };

    const handleDelete = async (workoutId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        const confirmDelete = window.confirm("Willst du dieses Workout wirklich löschen?");
        if (!confirmDelete) return;

        try {
            await axios.delete(`http://localhost:8080/workout/${workoutId}`);
            setWorkouts(workouts.filter(w => w.workoutId !== workoutId));
            alert("Workout gelöscht!");
        } catch (error) {
            console.error("Fehler beim Löschen:", error);
        }
    };

    return (
        <div className="container p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Workouts</h2>
                <button
                    className="btn btn-success"
                    onClick={() => navigate("/workout/manage")}
                >
                    Workout hinzufügen
                </button>
            </div>
            <table className="table table-hover">
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Dauer (Minuten)</th>
                    <th>Kalorien</th>
                    <th>Beschreibung</th>
                    <th>Bearbeiten</th>
                    <th>Löschen</th>
                </tr>
                </thead>
                <tbody>
                {workouts.map((workout: IWorkout) => (
                    <tr
                        key={workout.workoutId}
                        onClick={() => navigate(`/workout/details/id/${workout.workoutId}`)}
                        style={{ cursor: 'pointer' }}
                    >
                        <td>{workout.workoutName}</td>
                        <td>{workout.time}</td>
                        <td>{calculateTotalCalories(workout.exercises)} kcal</td>
                        <td>{workout.description}</td>
                        <td>
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/workout/manage/${workout.workoutId}`);
                                }}
                            >
                                Bearbeiten
                            </button>
                        </td>
                        <td>
                            <button
                                className="btn btn-danger btn-sm"
                                onClick={(e) => handleDelete(workout.workoutId, e)}
                            >
                                Löschen
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default Workout;