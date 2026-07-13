import { useMutation } from '@tanstack/react-query';
import { registerUser } from '@/src/services/api/auth.api';
import { RegisterInput } from '@/src/types/auth.types';
import { AxiosError } from 'axios';

/**
 * Hook do React Query para lidar com o Registro
 */
export const useRegister = () => {
  return useMutation({
    mutationFn: (data: RegisterInput) => registerUser(data),
    onError: (error) => {
      // Opcional: Aqui você pode disparar um Toast (ex: react-toastify ou shadcn/ui toast)
      console.error('Erro no registro:', error);
    },
    onSuccess: (data) => {
      // Opcional: Disparar um Toast de sucesso e talvez até redirecionar para o /login
      console.log('Registrado com sucesso:', data);
    },
  });
};
