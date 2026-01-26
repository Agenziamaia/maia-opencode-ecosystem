# Skill Module: Test-Driven Development

## <triggers>
Use this skill when user asks to:
- Write tests for new code
- Implement TDD workflow
- Create test coverage
- Test a component or function

## <procedure>

### Step 1: Analyze Code Under Test
- Understand the function/component purpose
- Identify all possible inputs and outputs
- List edge cases and error scenarios
- Determine testing dependencies (mocking required?)

### Step 2: Structure Test File
- Create test file: ComponentName.test.tsx or functionName.test.ts
- Import necessary testing utilities
- Import the code under test
- Set up any required mocks

### Step 3: Write Test Cases (Arrange-Act-Assert)
For each test case:
1. **Arrange**: Set up test data, mocks, and initial conditions
2. **Act**: Execute the function or render the component
3. **Assert**: Verify expected outcome with assertions

### Step 4: Test Categories

#### Unit Tests (Functions)
- Test with valid inputs
- Test with invalid/null inputs
- Test edge cases (empty strings, empty arrays, boundaries)
- Test error handling

#### Component Tests
- Test rendering with different props
- Test user interactions (clicks, inputs, forms)
- Test state changes
- Test loading and error states
- Test accessibility

#### Integration Tests
- Test multiple functions/components together
- Test data flow
- Test API integration (with mocks)

### Step 5: Mock External Dependencies
- Mock API calls with return values
- Mock browser APIs (localStorage, window)
- Mock external libraries
- Use vi.fn() for function mocking

### Step 6: Verify Coverage
- Run tests with coverage flag
- Aim for 80%+ coverage
- Review uncovered lines
- Add tests for uncovered branches

## <examples>

### Example: Unit Test
```typescript
import { describe, it, expect } from 'vitest';
import { capitalize, isEmpty } from './exampleUtils';

describe('capitalize', () => {
  it('should capitalize the first letter', () => {
    // Arrange
    const input = 'hello';
    const expected = 'Hello';

    // Act
    const result = capitalize(input);

    // Assert
    expect(result).toBe(expected);
  });

  it('should handle empty strings', () => {
    expect(capitalize('')).toBe('');
  });

  it('should handle null', () => {
    expect(capitalize(null as any)).toBe('');
  });
});

describe('isEmpty', () => {
  it('should return true for empty values', () => {
    expect(isEmpty('')).toBe(true);
    expect(isEmpty([])).toBe(true);
    expect(isEmpty({})).toBe(true);
    expect(isEmpty(null)).toBe(true);
    expect(isEmpty(undefined)).toBe(true);
  });

  it('should return false for non-empty values', () => {
    expect(isEmpty('hello')).toBe(false);
    expect(isEmpty([1, 2, 3])).toBe(false);
    expect(isEmpty({ key: 'value' })).toBe(false);
  });
});
```

### Example: Component Test
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Counter } from './Counter';

describe('Counter', () => {
  it('should render with initial value', () => {
    render(<Counter initialValue={5} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should increment when + button clicked', () => {
    render(<Counter initialValue={0} />);
    const incrementButton = screen.getByLabelText('Increase');
    fireEvent.click(incrementButton);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should call onChange when value changes', () => {
    const handleChange = vi.fn();
    render(<Counter initialValue={0} onChange={handleChange} />);
    const incrementButton = screen.getByLabelText('Increase');
    fireEvent.click(incrementButton);
    expect(handleChange).toHaveBeenCalledWith(1);
  });
});
```

## <notes>
- Always follow Arrange-Act-Assert pattern
- Use descriptive test names that explain behavior
- Test one thing per test case
- Mock external dependencies
- Keep tests simple and focused
- Use vi.fn() for mocking functions
- Test both happy paths and error scenarios
- Maintain test independence (no shared state)
