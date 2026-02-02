export interface PaginatedData<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface ApiResponse<T = any> {
    data: T;
    success: boolean;
    result?: number;
    message?: string;
    errorCode?: string;
}