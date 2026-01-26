# Skill Module: React Component Generation

## <triggers>
Use this skill when user asks to:
- Create a new React component
- Build a UI element
- Generate a component from a description
- Implement a feature requiring React components

## <procedure>

### Step 1: Analyze Requirements
- Identify component purpose and functionality
- Determine required props and their types
- Check if component needs state (useState, useReducer)
- Identify any hooks needed (useEffect, useCallback, useMemo)
- Check accessibility requirements

### Step 2: Create Component Structure
1. Create TypeScript interface for props
2. Implement functional component with proper imports
3. Add JSX structure following AGENTS.md patterns
4. Apply appropriate styling class names
5. Add accessibility attributes (aria-labels, role)
6. Export component using named export

### Step 3: Add State and Logic
- Add hooks as needed
- Implement event handlers
- Add proper error boundaries if needed
- Include loading states if async operations
- Handle edge cases and empty states

### Step 4: Create Barrel File
- Create or update index.ts in components directory
- Export the new component
- Maintain alphabetical order in exports

### Step 5: Write Tests
- Create test file following: ComponentName.test.tsx
- Test rendering with different props
- Test user interactions (clicks, form inputs)
- Test edge cases (null, undefined, empty states)
- Follow Arrange-Act-Assert pattern

### Step 6: Documentation (Optional)
- Add JSDoc comments for complex logic
- Document prop interface with examples
- Note any dependencies or external services used

## <examples>

### Example: Simple Counter Component
```typescript
import React, { useState } from 'react';

interface CounterProps {
  initialValue?: number;
  onChange?: (value: number) => void;
}

export const Counter: React.FC<CounterProps> = ({
  initialValue = 0,
  onChange,
}) => {
  const [count, setCount] = useState(initialValue);

  const increment = () => {
    const newValue = count + 1;
    setCount(newValue);
    onChange?.(newValue);
  };

  const decrement = () => {
    const newValue = count - 1;
    setCount(newValue);
    onChange?.(newValue);
  };

  return (
    <div className="counter">
      <button type="button" onClick={decrement} aria-label="Decrease">
        -
      </button>
      <span>{count}</span>
      <button type="button" onClick={increment} aria-label="Increase">
        +
      </button>
    </div>
  );
};
```

## <notes>
- Always use functional components, not class components
- Prefer named exports over default exports
- Use TypeScript interfaces for prop types
- Follow AGENTS.md style guidelines (2 spaces, single quotes, semicolons)
- Test all edge cases and user interactions
- Ensure accessibility with proper ARIA attributes
