interface IWorkout{
    workoutId: number;
    workoutName: string;
    duration: number;
    kcal: number;
    description:string;
    exercises: IExercise[];
}