import { api } from '@/src/lib/axios';

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  age?: number | '';
  height?: number | '';
  weight?: number | '';
  gender?: string;
  restTimeGoal?: number | '';
}

export const UserAPI = {
  /**
   * Atualiza os dados básicos do perfil do usuário.
   */
  updateProfile: async (data: UpdateProfileData) => {
    const response = await api.put('/user/profile', data);
    return response.data;
  },

  /**
   * Faz upload da imagem de avatar.
   */
  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/user/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Remove a imagem de avatar do usuário.
   */
  removeAvatar: async () => {
    const response = await api.delete('/user/avatar');
    return response.data;
  }
};
