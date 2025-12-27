import { Routes, Route } from 'react-router-dom';
import { Gallery } from './Gallery';
import { Viewer } from './Viewer';

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Gallery />} />
        <Route path="/view/:slug" element={<Viewer />} />
      </Routes>
    </div>
  );
}

export default App;

