import React, { createContext, useContext, useState, ReactNode } from 'react';
import {IExercise} from "../models/IExercise";

interface ExerciseContextProps {
    selectedExercise: IExercise | null;
    setSelectedExercise: (exercise: IExercise | null) => void;
}

const ExerciseContext = createContext<ExerciseContextProps | undefined>(undefined);

interface ExerciseProviderProps {
    children: ReactNode;
}

export const ExerciseProvider: React.FC<ExerciseProviderProps> = ({ children }) => {
    const [selectedExercise, setSelectedExercise] = useState<IExercise | null>(null);

    return (
        <ExerciseContext.Provider value={{ selectedExercise, setSelectedExercise }}>
            {children}
        </ExerciseContext.Provider>
    );
};

export const useExerciseContext = (): ExerciseContextProps => {
    const context = useContext(ExerciseContext);
    if (!context) {
        throw new Error('useExerciseContext muss innerhalb des ExerciseProvider verwendet werden');
    }
    return context;
};
