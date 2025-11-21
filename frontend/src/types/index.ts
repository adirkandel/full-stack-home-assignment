export interface User {
  id: string;
  email: string;
  username: string;
  name?: string;
}


export interface TaskAssignment {
  id: string;
  taskId: string;
  userId: string;
  user?: User;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  assignments?: TaskAssignment[];
  comments?: Comment[];
}

export interface Comment {
  id: string;
  content: string;
  taskId: string;
  userId: string;
  createdAt: string;
  user?: User;
}



export type ApiResponse = any;

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
}

// ========== Auth Types ==========
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  name?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  token: string;
  user: User;
}

export interface AuthMeResponse {
  user: User;
}