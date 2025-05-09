interface IWorkout{
    workoutId: number;
    workoutName: string;
    duration: number;
    kcal: number;
    exercices: IExercise[];
}