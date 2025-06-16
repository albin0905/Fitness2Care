export interface IWorkout{
    workoutId: number;
    workoutName: string;
    time: number;
    kcal: number;
    description:string;
    exercises: IExercise[];
}