import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import AddIcon from '@mui/icons-material/Add';
import {WorkoutService} from "../../_components/services/WorkoutService";
import {IWorkout} from "../../_common/models/IWorkout";

const Workout = () => {
    const [workouts, setWorkouts] = useState<IWorkout[]>([]);
    const navigate = useNavigate();

    const fetchWorkouts = async () => {
        try {
            const data = await WorkoutService.getAllWorkouts();
            setWorkouts(data);
        } catch (error) {
            console.error('Fehler beim Laden der Workouts:', error);
        }
    };
    useEffect(() => {
        fetchWorkouts();
    }, []);

    const handleDelete = async (workoutId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        const confirmDelete = window.confirm("Willst du dieses Workout wirklich löschen?");
        if (!confirmDelete) return;

        try {
            await WorkoutService.deleteWorkout(workoutId);
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
                    className="btn btn-outline-success"
                    onClick={() => navigate("/workout/manage")}
                >
                    <AddIcon/>
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
                        <td>{WorkoutService.calculateTotalCalories(workout.exercises)} kcal</td>
                        <td>{workout.description}</td>
                        <td>
                            <button
                                className="btn btn-outline-primary btn-sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/workout/manage/${workout.workoutId}`);
                                }}
                            >
                                <EditIcon/>
                            </button>
                        </td>
                        <td>
                            <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={(e) => handleDelete(workout.workoutId, e)}
                            >
                                <DeleteForeverIcon/>
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