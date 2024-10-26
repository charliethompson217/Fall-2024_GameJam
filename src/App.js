import React, { useEffect, useState } from 'react';
import './App.css';
import Sketch from './Sketch';

export default function App() {
  const [serverTime, setServerTime] = useState('');

  useEffect(() => {
    const ws = new WebSocket('wss://b2b7fdgyj9.execute-api.us-east-2.amazonaws.com/dev/');

    ws.onopen = () => {
      ws.send(JSON.stringify({ action: "getTime" }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.time) {
          setServerTime(data.time); // Update server time
        }
      } catch (e) {
        console.error("Error parsing WebSocket message:", e);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = (event) => {
      console.log("WebSocket connection closed:", event);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  useEffect(() => {
    const preventKeyDefault = (e) => e.preventDefault();
    const preventMouseDefault = (e) => e.preventDefault();

    window.addEventListener('keydown', preventKeyDefault);
    window.addEventListener('contextmenu', preventMouseDefault);
    window.addEventListener('wheel', preventMouseDefault, { passive: false });
    window.addEventListener('touchmove', preventMouseDefault, { passive: false });

    return () => {
      window.removeEventListener('keydown', preventKeyDefault);
      window.removeEventListener('contextmenu', preventMouseDefault);
      window.removeEventListener('wheel', preventMouseDefault);
      window.removeEventListener('touchmove', preventMouseDefault);
    };
  }, []);

  return (
    <div className="App">
      <h1>Server Time: {serverTime}</h1>
      {serverTime && <Sketch serverTime={serverTime} />}
    </div>
  );
}