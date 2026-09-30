import api from './api';

export interface TpoUser {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: string;
  createdAt: string;
}

class TpoUserService {
  async getTpoUsers(): Promise<TpoUser[]> {
    const response = await api.get('/tpo/users');
    return response.data;
  }

  async createTpoUser(data: any): Promise<TpoUser> {
    const response = await api.post('/tpo/users', data);
    return response.data.user;
  }

  async getMyProfile(): Promise<TpoUser> {
    const response = await api.get('/tpo/profile');
    return response.data;
  }

  async updateMyProfile(data: { name?: string; phone?: string }): Promise<TpoUser> {
    const response = await api.put('/tpo/profile', data);
    return response.data.user;
  }
}

export default new TpoUserService();
