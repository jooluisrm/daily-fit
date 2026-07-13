import { api } from '@/src/lib/axios';
import { RegisterInput, RegisterResponse } from '@/src/types/auth.types';

/**
 * Registra um novo usuário no backend
 */
export const registerUser = async (data: RegisterInput): Promise<RegisterResponse> => {
  const response = await api.post<RegisterResponse>('/auth/register', data);
  return response.data;
};
