import React from 'react';

interface ExampleComponentProps {
  title: string;
  count: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export const ExampleComponent: React.FC<ExampleComponentProps> = ({
  title,
  count,
  onIncrement,
  onDecrement,
}) => {
  return (
    <div className="example-container">
      <h2>{title}</h2>
      <div className="counter-display">
        <span>Count: {count}</span>
      </div>
      <div className="button-group">
        <button type="button" onClick={onDecrement} aria-label="Decrease count">
          -
        </button>
        <button type="button" onClick={onIncrement} aria-label="Increase count">
          +
        </button>
      </div>
    </div>
  );
};
