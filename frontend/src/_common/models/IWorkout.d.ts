interface IWorkout{
    id:number,
    time:number,
    exercises: IExercise[],
    workoutName: string,
    kcal: number
}