import React from 'react';
import { useExampleFeature } from './hooks';

export const ExampleFeature: React.FC = () => {
  const { data, loading, error, refetch } = useExampleFeature();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div>
        Error: {error}
        <button type="button" onClick={refetch}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="example-feature">
      <h3>Example Feature</h3>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <button type="button" onClick={refetch}>
        Refresh
      </button>
    </div>
  );
};
