import axios from 'axios';

export class UserService {

    static async login(email: string, password: string): Promise<IMember> {
        const response = await axios.get<IMember>('http://localhost:8080/member/login', {
            params: { email, password }
        });
        return response.data;
    }

    static async register(
        memberData: {
            firstName: string;
            lastName: string;
            email: string;
            password: string;
            phone: string;
            weight: number;
        }
    ): Promise<IMember> {
        const response = await axios.post<IMember>(
            'http://localhost:8080/member/register',
            memberData
        );
        return response.data;
    }

    static async updateMember(memberId: number,
                              updatedData: {
                                  firstName: string;
                                  lastName: string;
                                  email: string;
                                  phone: string | number;
                                  weight: number;
                                  password: string
                              }
    ): Promise<IMember> {
        const response = await axios.put<IMember>(
            `http://localhost:8080/member/${memberId}`,
            updatedData
        );
        return response.data;
    }
}