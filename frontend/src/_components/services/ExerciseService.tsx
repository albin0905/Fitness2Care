import axios from 'axios';

export class ExerciseService {
    static async getAllExercises(): Promise<IExercise[]> {
        const response = await axios.get<IExercise[]>('http://localhost:8080/exercise/exercises');
        return response.data;
    }

    static async createExercise(exercise: Omit<IExercise, 'exerciseId'>): Promise<IExercise> {
        const response = await axios.post<IExercise>('http://localhost:8080/exercise/addExercise', exercise);
        return response.data;
    }

    static async updateExercise(id: number, exercise: IExercise): Promise<IExercise> {
        const response = await axios.put<IExercise>(`http://localhost:8080/exercise/${id}`, exercise);
        return response.data;
    }

    static async deleteExercise(id: number): Promise<void> {
        await axios.delete(`http://localhost:8080/exercise/${id}`);
    }
}