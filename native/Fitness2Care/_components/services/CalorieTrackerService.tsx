import axios from 'axios';
import { IGoal } from '../../_common/models/IGoal';

export class CalorieTrackerService {
    static async getCurrentGoal(userId: number, date: string): Promise<IGoal> {
        const response = await axios.get<IGoal>(
            `http://localhost:8080/goal/currentGoal/${userId}/${date}`
        );
        return response.data;
    }

    static async updateGoalKcal(goalId: number, kcal: number): Promise<IGoal> {
        const response = await axios.put<IGoal>(`http://localhost:8080/goal/${goalId}`,
            { kcal }, { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    }

    static async searchProductsByName(searchTerm: string, page: number = 0): Promise<IProduct[]> {
        const response = await axios.get(
            `http://localhost:8080/product/filterByName/${searchTerm}?page=${page}`
        );
        return response.data.content;
    }
}