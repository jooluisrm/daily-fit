import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Opcional: Interceptors para log de requisições ou tratamento de erros globais
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Pode formatar mensagens de erro aqui, se desejar
    return Promise.reject(error);
  }
);
