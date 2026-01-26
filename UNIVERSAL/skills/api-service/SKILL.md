# Skill Module: API Service Creation

## <triggers>
Use this skill when user asks to:
- Create an API service module
- Set up data fetching
- Build API client functions
- Implement REST API calls

## <procedure>

### Step 1: Define Service Interface
- Identify API endpoints needed
- Determine request/response data structures
- Define TypeScript types for all data models
- Check authentication requirements
- Identify error handling needs

### Step 2: Create Type Definitions
- Create interface for API responses
- Create interface for request parameters
- Create error types for different failure scenarios
- Export types from types/index.ts

### Step 3: Implement Fetch Function
- Create base fetch function with error handling
- Add proper logging for errors
- Include request/response interceptors if needed
- Handle HTTP status codes appropriately
- Use try/catch for all async operations

### Step 4: Create Service Methods
- Implement CRUD operations as needed
- Create wrapper functions for common patterns
- Add proper type parameters
- Use consistent naming conventions
- Return typed responses

### Step 5: Add Utility Methods
- Create methods for GET, POST, PUT, DELETE
- Add query parameter handling
- Implement request body serialization
- Add headers management
- Handle authentication tokens

### Step 6: Write Tests
- Mock API responses
- Test success scenarios
- Test error scenarios (network errors, 404, 500)
- Test request formatting
- Verify type safety

## <examples>

### Example: User Service
```typescript
import { logError } from '@/utils/logger';

interface FetchDataParams {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

export async function fetchData<T>(
  params: FetchDataParams
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(params.endpoint, {
      method: params.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...params.headers,
      },
      body: params.body ? JSON.stringify(params.body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = (await response.json()) as T;
    return { data, status: response.status, message: 'Success' };
  } catch (error) {
    logError('API request failed', { error, params });
    throw new Error(`Request failed: ${error}`);
  }
}

export const apiService = {
  get: <T>(endpoint: string, headers?: Record<string, string>) =>
    fetchData<T>({ endpoint, method: 'GET', headers }),
  post: <T>(endpoint: string, body: unknown, headers?: Record<string, string>) =>
    fetchData<T>({ endpoint, method: 'POST', body, headers }),
  put: <T>(endpoint: string, body: unknown, headers?: Record<string, string>) =>
    fetchData<T>({ endpoint, method: 'PUT', body, headers }),
  delete: <T>(endpoint: string, headers?: Record<string, string>) =>
    fetchData<T>({ endpoint, method: 'DELETE', headers }),
};
```

## <notes>
- Always use proper error handling with logging
- Type all request/response data
- Use structured logging for debugging
- Implement retry logic for transient failures if needed
- Consider implementing request caching
- Follow AGENTS.md patterns for async operations
