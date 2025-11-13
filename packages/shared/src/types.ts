// Shared types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  timestamp: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

