import React, { createContext, ReactNode, useContext, useState } from "react";


export interface WorkoutContextProps {
    workouts: IWorkout[];
    setWorkouts: (workouts: IWorkout[]) => void;
}

export const WorkoutContext = createContext<WorkoutContextProps>({
    workouts: [],
    setWorkouts: () => {},
});

export const useWorkoutContext = () => {
    const context = useContext(WorkoutContext);
    if (!context) {
        throw new Error('useWorkoutContext must be used within a WorkoutProvider');
    }
    return context;
};

export const WorkoutProvider = ({ children }: { children: ReactNode }) => {
    const [workouts, setWorkouts] = useState<IWorkout[]>([]);

    return (
        <WorkoutContext.Provider value={{ workouts, setWorkouts }}>
            {children}
        </WorkoutContext.Provider>
    );
};
