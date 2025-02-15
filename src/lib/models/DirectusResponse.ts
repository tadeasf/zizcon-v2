export interface DirectusResponse<T> {
  data: T[];
  meta?: {
    total_count: number;
    filter_count: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    pageCount: number;
  };
} 