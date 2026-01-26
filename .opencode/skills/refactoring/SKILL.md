# Skill Module: Code Refactoring

## <triggers>
Use this skill when user asks to:
- Refactor existing code
- Improve code quality
- Fix code smells
- Optimize performance
- Simplify complex logic

## <procedure>

### Step 1: Analyze Current Code
- Identify code smells and anti-patterns
- Check for duplicate code (DRY violation)
- Look for long functions (> 50 lines)
- Identify complex conditional logic
- Check for hardcoded values
- Find nested loops and deep indentation

### Step 2: Define Refactoring Goals
- Improve readability
- Reduce complexity
- Improve maintainability
- Enhance performance
- Remove duplication
- Better separation of concerns

### Step 3: Apply Refactoring Patterns

#### Extract Function
- Move reusable logic to separate functions
- Give functions descriptive names
- Keep functions pure when possible
- Single responsibility principle

#### Extract Variable
- Replace complex expressions with named variables
- Improve readability
- Make logic clearer
- Self-documenting code

#### Extract Component
- Break large components into smaller ones
- Compose components
- Move state management to appropriate level
- Create reusable UI components

#### Replace Conditional with Polymorphism
- Use strategy pattern for different behaviors
- Use object lookups instead of long if/else chains
- Use Maps for key-value relationships

#### Simplify Conditional Logic
- Early returns (guard clauses)
- Use ternary operator for simple cases
- Use switch for multiple discrete cases
- Use object lookups for key-value mappings

### Step 4: Performance Optimizations
- Memoize expensive computations (useMemo)
- Memoize callbacks (useCallback)
- Lazy load components (React.lazy)
- Virtualize long lists
- Debounce/throttle event handlers
- Optimize renders (React.memo)

### Step 5: Update Tests
- Ensure all tests still pass
- Add tests for extracted functions
- Update test expectations if behavior changes
- Check for test coverage

### Step 6: Verify Refactoring
- Run existing tests
- Run linter
- Run type checker
- Review code changes
- Ensure no behavior changes

## <examples>

### Example: Before Refactoring
```typescript
// Complex function with code smells
export function processUserData(data: any) {
  let result = [];
  for (let i = 0; i < data.length; i++) {
    let user = data[i];
    if (user.age >= 18) {
      if (user.status === 'active') {
        if (user.subscriptions.includes('premium')) {
          let formatted = {
            name: user.firstName + ' ' + user.lastName,
            email: user.email.toLowerCase(),
            age: user.age,
            type: 'premium'
          };
          result.push(formatted);
        } else {
          let formatted = {
            name: user.firstName + ' ' + user.lastName,
            email: user.email.toLowerCase(),
            age: user.age,
            type: 'standard'
          };
          result.push(formatted);
        }
      }
    }
  }
  return result;
}
```

### Example: After Refactoring
```typescript
interface User {
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  status: string;
  subscriptions: string[];
}

interface ProcessedUser {
  name: string;
  email: string;
  age: number;
  type: 'premium' | 'standard';
}

function isEligibleUser(user: User): boolean {
  return user.age >= 18 && user.status === 'active';
}

function getUserType(subscriptions: string[]): 'premium' | 'standard' {
  return subscriptions.includes('premium') ? 'premium' : 'standard';
}

function formatUser(user: User): ProcessedUser {
  return {
    name: `${user.firstName} ${user.lastName}`,
    email: user.email.toLowerCase(),
    age: user.age,
    type: getUserType(user.subscriptions),
  };
}

export function processUserData(data: User[]): ProcessedUser[] {
  return data
    .filter(isEligibleUser)
    .map(formatUser);
}
```

## <notes>
- Refactor in small steps
- Run tests after each change
- Don't change behavior, only structure
- Use meaningful variable and function names
- Follow SOLID principles
- Keep functions under 30 lines when possible
- Use TypeScript to enforce types
- Document complex algorithms
- Consider performance implications
