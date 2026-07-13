export interface RegisterInput {
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  termsAccepted: boolean;
}

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  name: string | null;
  termsAccepted: boolean;
  createdAt: string;
}

export interface RegisterResponse {
  success: boolean;
  user: User;
  error?: string;
}
