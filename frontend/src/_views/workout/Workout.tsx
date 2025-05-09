import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface IExercise {
    exerciseId: number;
    exerciseName: string;
    exerciceLevel: string;
    bodyPart: string;
    imageURL: string;
}

interface IWorkout {
    workoutId: number;
    workoutName: string;
    duration: number;
    kcal: number;
    exercices: IExercise[];
}

const Workout = () => {
    const [workouts, setWorkouts] = useState<IWorkout[]>([]);
    const [selectedWorkout, setSelectedWorkout] = useState<IWorkout | null>(null);

    useEffect(() => {
        axios.get('http://localhost:8080/workout/workouts')
            .then(res => setWorkouts(res.data))
            .catch(err => console.error('Fehler beim Laden der Workouts', err));
    }, []);

    const fetchWorkoutDetails = (workoutName: string) => {
        axios.get<IWorkout>(`http://localhost:8080/workout/workout/details/${workoutName}`)
            .then(res => setSelectedWorkout(res.data))
            .catch(err => console.error('Fehler beim Laden der Details', err));
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">All Workouts</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {workouts.map((workout) => (
                    <div
                        key={workout.workoutId}
                        className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center cursor-pointer hover:bg-gray-100"
                        onClick={() => fetchWorkoutDetails(workout.workoutName)}
                    >
                        <h2 className="text-md font-bold mb-2">{workout.workoutName}</h2>
                        <img src="/workout1.png" alt="Workout" className="w-32 h-32 object-cover mb-4" />
                        <p className="text-sm text-gray-600 mb-1">Dauer: {workout.duration} Min</p>
                        <p className="text-sm text-gray-600">Kcal: {workout.kcal}</p>
                    </div>
                ))}
            </div>

            {selectedWorkout && (
                <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4">Exercises für: {selectedWorkout.workoutName}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {selectedWorkout.exercices.map((ex) => (
                            <div key={ex.exerciseId} className="border rounded p-4 flex items-center gap-4">
                                <input type="checkbox" className="form-checkbox h-5 w-5" />
                                <img src={ex.imageURL} alt={ex.exerciseName} className="w-16 h-16 object-cover" />
                                <div>
                                    <p className="font-bold">{ex.exerciseName}</p>
                                    <p className="text-sm text-gray-500">{ex.bodyPart} - {ex.exerciceLevel}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Workout;
