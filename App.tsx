import { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Redirect to the static HTML file
    window.location.href = '/';
  }, []);

  return null;
}

export default App;
