import { useEffect } from 'react';
import { Header } from './components/Header/Header';
import { Toolbar } from './components/Toolbar/Toolbar';
import { Canvas } from './components/Canvas/Canvas';
import { Library } from './components/Library/Library';
import { PropertyInspector } from './components/PropertyInspector/PropertyInspector';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useLayoutStore } from './store/layoutStore';
import './App.css';

function App() {
  useKeyboardShortcuts();

  const loadLayouts = useLayoutStore((state) => state.loadLayouts);

  useEffect(() => {
    loadLayouts();
  }, [loadLayouts]);

  return (
    <div className="app">
      <Header />
      <div className="app-body">
        <Toolbar />
        <div className="canvas-container">
          <Canvas />
        </div>
        <div className="right-panel">
          <Library />
          <PropertyInspector />
        </div>
      </div>
    </div>
  );
}

export default App;
