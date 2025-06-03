export interface IGoal {
    goalId: number;
    goalName: string;
    date: string;
    kcal: number;
    userId: number;
    workouts: IWorkout[];
}