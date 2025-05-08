// components/Workout.tsx
import React, { useEffect } from 'react';
import axios from 'axios';
import {useWorkoutContext} from "../../_common/context/WorkoutContext";

const Workout = () => {
    const { workouts, setWorkouts } = useWorkoutContext();

    const fetchWorkouts = async () => {
        try {
            const response = await axios.get<IWorkout[]>('http://localhost:8080/workout/workouts');
            console.log(response.data); // Add this to inspect the data
            setWorkouts(response.data);
        } catch (error) {
            console.error('Fehler beim Laden der Workouts', error);
        }
    };


    useEffect(() => {
        fetchWorkouts();
    }, [setWorkouts]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
            {workouts.map((workout:any) => (
                <div key={workout.workoutId} className="bg-white shadow-md rounded-lg p-4">
                    <h2 className="text-xl font-bold">{workout.workoutName}</h2>
                    <p>{workout.description}</p>
                    <p className="text-gray-500 text-sm">Dauer: {workout.duration} Minuten</p>
                </div>
            ))}
        </div>
    );
};

export default Workout;
