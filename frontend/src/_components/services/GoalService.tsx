import axios from 'axios';
import {IGoal} from "../../_common/models/IGoal";


export class GoalService {
    static async getGoalsByMemberId(memberId: number): Promise<IGoal[]> {
        const response = await axios.get<IGoal[]>(`http://localhost:8080/goal/goals/${memberId}`);
        return response.data;
    }

    static async createGoal(goalData: { goalName: string; kcal: number; date: string }, memberId: number): Promise<IGoal> {
        const response = await axios.post<IGoal>('http://localhost:8080/goal/addGoal', {
            ...goalData,
            userId: memberId,
            workouts: [] // Standardmäßig leeres Array für Workouts
        });
        return response.data;
    }

    static async updateGoal(goal: IGoal): Promise<IGoal> {
        const response = await axios.put<IGoal>(`http://localhost:8080/goal/${goal.goalId}`, goal);
        return response.data;
    }

    static async deleteGoal(goalId: number): Promise<void> {
        await axios.delete(`http://localhost:8080/goal/${goalId}`);
    }

    static async addWorkoutToGoal(goalId: number, workoutId: number): Promise<IGoal> {
        const response = await axios.put<IGoal>(
            `http://localhost:8080/goal/${goalId}/add-workout`,
            { workoutId }
        );
        return response.data;
    }

    static async getAllWorkouts(): Promise<IWorkout[]> {
        const response = await axios.get<IWorkout[]>('http://localhost:8080/workout/workouts');
        return response.data;
    }

    static async removeWorkoutFromGoal(goalId: number, workoutId: number): Promise<IGoal> {
        const response = await axios.delete<IGoal>(
            `http://localhost:8080/goal/${goalId}/remove-workout/${workoutId}`
        );
        return response.data;
    }
}