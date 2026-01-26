import { useState } from 'react';
import { ExampleComponent } from './components/ExampleComponent';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="app">
      <header>
        <h1>🚀 MAIA App</h1>
        <p>Zero-setup React development</p>
      </header>
      <main>
        <ExampleComponent
          title="Counter Example"
          count={count}
          onIncrement={() => setCount((c) => c + 1)}
          onDecrement={() => setCount((c) => c - 1)}
        />
      </main>
      <footer>
        <p>Powered by MAIA Droids</p>
      </footer>
    </div>
  );
}

export default App;
