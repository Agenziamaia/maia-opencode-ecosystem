import { describe, it, expect } from 'vitest';
import { capitalize, truncate, isEmpty, debounce } from './exampleUtils';

describe('capitalize', () => {
  it('should capitalize the first letter of a string', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  it('should lowercase the rest of the string', () => {
    expect(capitalize('hELLO')).toBe('Hello');
  });

  it('should handle empty strings', () => {
    expect(capitalize('')).toBe('');
  });

  it('should handle single character strings', () => {
    expect(capitalize('a')).toBe('A');
  });
});

describe('truncate', () => {
  it('should return the string if it is shorter than maxLength', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('should truncate the string and add ellipsis', () => {
    expect(truncate('hello world', 5)).toBe('hello...');
  });

  it('should handle empty strings', () => {
    expect(truncate('', 10)).toBe('');
  });

  it('should handle exact length strings', () => {
    expect(truncate('hello', 5)).toBe('hello');
  });
});

describe('isEmpty', () => {
  it('should return true for null', () => {
    expect(isEmpty(null)).toBe(true);
  });

  it('should return true for undefined', () => {
    expect(isEmpty(undefined)).toBe(true);
  });

  it('should return true for empty strings', () => {
    expect(isEmpty('')).toBe(true);
  });

  it('should return true for whitespace strings', () => {
    expect(isEmpty('   ')).toBe(true);
  });

  it('should return true for empty arrays', () => {
    expect(isEmpty([])).toBe(true);
  });

  it('should return true for empty objects', () => {
    expect(isEmpty({})).toBe(true);
  });

  it('should return false for non-empty values', () => {
    expect(isEmpty('hello')).toBe(false);
    expect(isEmpty([1])).toBe(false);
    expect(isEmpty({ a: 1 })).toBe(false);
  });
});

describe('debounce', () => {
  it('should delay function execution', async () => {
    let called = false;
    const fn = debounce(() => {
      called = true;
    }, 100);

    fn();
    expect(called).toBe(false);

    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(called).toBe(true);
  });

  it('should cancel previous execution', async () => {
    let count = 0;
    const fn = debounce(() => {
      count += 1;
    }, 100);

    fn();
    fn();
    fn();

    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(count).toBe(1);
  });
});
