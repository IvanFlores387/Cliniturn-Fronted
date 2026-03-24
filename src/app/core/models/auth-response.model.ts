import { User } from './user.model';

export interface AuthResponse {
  ok: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}
