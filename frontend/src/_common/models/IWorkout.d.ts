interface IWorkout{
    workoutId:number,
    time:number,
    exercises: IExercise[],
    workoutName: string,
    kcal: number
}