export interface User {
  _id: string;
  role: 'law_firm' | 'corporate' | 'admin'|'citizen';
  username: string;
  email: string;
  status: 'active' | 'suspended' | 'inactive';
  law_firm_name?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDTO {
  role: User['role'];
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  law_firm_name?: string;
}

export interface UpdateUserStatusDTO {
  status: User['status'];
  reason?: string;
}

export interface UserFilters {
  status?: User['status'];
  role?: User['role'];
  search?: string;
}

export interface PaginatedResponse<T> {
  users: T[];
  totalPages: number;
  currentPage: number;
 
}