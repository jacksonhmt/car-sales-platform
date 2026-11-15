export interface ApiError {
  field: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  code?: string;
  message: string;
  path?: string;
  data?: T;
  errors?: ApiError[];
}

export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;}
