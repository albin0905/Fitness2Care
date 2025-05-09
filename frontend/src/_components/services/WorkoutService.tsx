import axios from 'axios';

export class WorkoutService {
    static async getWorkoutDetails(id: number): Promise<IWorkout> {
        const response = await axios.get<IWorkout>(`http://localhost:8080/workout/workout/details/id/${id}`);
        return response.data;
    }

    static async updateWorkout(id: number, workout: Partial<IWorkout>): Promise<IWorkout> {
        const response = await axios.put<IWorkout>(`http://localhost:8080/workout/${id}`, workout);
        return response.data;
    }
}