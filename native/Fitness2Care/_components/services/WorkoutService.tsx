import axios from 'axios';
import { IExercise } from '../../_common/models/IExercise';
import { IWorkout } from '../../_common/models/IWorkout';

export class WorkoutService {
    static async getAllWorkouts(): Promise<IWorkout[]> {
        try {
            const response = await axios.get<IWorkout[]>('http://localhost:8080/workout/workouts');
            return response.data;
        } catch (error) {
            console.error('Error fetching workouts:', error);
            throw error;
        }
    }

    static async getWorkoutDetails(id: number): Promise<IWorkout> {
        try {
            const response = await axios.get<IWorkout>(`http://localhost:8080/workout/workout/details/id/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching workout with id ${id}:`, error);
            throw error;
        }
    }

    static async createWorkout(workout: Omit<IWorkout, 'workoutId'>): Promise<IWorkout> {
        try {
            const response = await axios.post<IWorkout>('http://localhost:8080/workout', workout);
            return response.data;
        } catch (error) {
            console.error('Error creating workout:', error);
            throw error;
        }
    }

    static async updateWorkout(id: number, workout: Partial<IWorkout>): Promise<IWorkout> {
        try {
            const response = await axios.put<IWorkout>(`http://localhost:8080/workout/${id}`, workout);
            return response.data;
        } catch (error) {
            console.error(`Error updating workout with id ${id}:`, error);
            throw error;
        }
    }

    static async deleteWorkout(id: number): Promise<void> {
        try {
            await axios.delete(`http://localhost:8080/workout/${id}`);
        } catch (error) {
            console.error(`Error deleting workout with id ${id}:`, error);
            throw error;
        }
    }

    static calculateTotalCalories(exercises: IExercise[] = []): number {
        return exercises.reduce((sum, ex) => sum + (ex.kcal || 0), 0);
    }
}