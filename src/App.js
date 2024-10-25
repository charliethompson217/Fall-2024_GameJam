import React, { useEffect } from 'react';
import './App.css';
import Sketch from './Sketch';

export default function App() {
  useEffect(() => {
    const preventKeyDefault = (e) => e.preventDefault();
    const preventMouseDefault = (e) => e.preventDefault();

    // Add event listeners
    window.addEventListener('keydown', preventKeyDefault);
    window.addEventListener('contextmenu', preventMouseDefault); // Right-click
    window.addEventListener('wheel', preventMouseDefault, { passive: false }); // Mouse wheel
    window.addEventListener('touchmove', preventMouseDefault, { passive: false }); // Touch scroll

    // Clean up event listeners on component unmount
    return () => {
      window.removeEventListener('keydown', preventKeyDefault);
      window.removeEventListener('contextmenu', preventMouseDefault);
      window.removeEventListener('wheel', preventMouseDefault);
      window.removeEventListener('touchmove', preventMouseDefault);
    };
  }, []);

  return (
    <div className="App">
      <Sketch />
    </div>
  );
}