import { logError } from '../utils/logger';

interface FetchDataParams {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

export async function fetchData<T>(
  params: FetchDataParams
): Promise<ApiResponse<T>> {
  const { endpoint, method = 'GET', body } = params;

  try {
    const response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = (await response.json()) as T;

    return {
      data,
      status: response.status,
      message: 'Success',
    };
  } catch (error) {
    logError('Failed to fetch data', { error, endpoint });
    throw new Error(`Unable to fetch data from ${endpoint}`);
  }
}

export const apiService = {
  get: <T>(endpoint: string) => fetchData<T>({ endpoint, method: 'GET' }),
  post: <T>(endpoint: string, body: unknown) =>
    fetchData<T>({ endpoint, method: 'POST', body }),
  put: <T>(endpoint: string, body: unknown) =>
    fetchData<T>({ endpoint, method: 'PUT', body }),
  delete: <T>(endpoint: string) =>
    fetchData<T>({ endpoint, method: 'DELETE' }),
};
