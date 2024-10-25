import React, { useRef, useEffect } from 'react';

export default function Sketch() {
  const sketchRef = useRef();
  const p5Instance = useRef(null); // Hold p5 instance reference to ensure it's not reinitialized

  useEffect(() => {
    // Function for creating the sketch
    const sketch = (p) => {
      let vw = Math.min(document.documentElement.clientWidth, window.innerWidth);
      let vh = Math.min(document.documentElement.clientHeight, window.innerHeight);
      const margin = 0.03; // 3% margin

      p.setup = () => {
        const canvas = p.createCanvas(vw, vh);
        canvas.parent(sketchRef.current); // Attach canvas to the ref DOM element
        p.textAlign(p.CENTER, p.CENTER); // Center-align text
        p.textSize(Math.min(vw, vh) / 10); // Set the text size based on canvas size
        p.fill(255); // White text
      };

      p.draw = () => {
        p.background(0); // Black background

        // Set line thickness and stroke color for the L shapes
        p.stroke(255); // White
        p.strokeWeight(5);

        const marginX = vw * margin;
        const marginY = vh * margin;

        // Draw L shape in top-left
        p.line(marginX, marginY, marginX + 50, marginY); // Horizontal line
        p.line(marginX, marginY, marginX, marginY + 50); // Vertical line

        // Draw L shape in top-right
        p.line(vw - marginX, marginY, vw - marginX - 50, marginY); // Horizontal line
        p.line(vw - marginX, marginY, vw - marginX, marginY + 50); // Vertical line

        // Draw L shape in bottom-left
        p.line(marginX, vh - marginY, marginX + 50, vh - marginY); // Horizontal line
        p.line(marginX, vh - marginY, marginX, vh - marginY - 50); // Vertical line

        // Draw L shape in bottom-right
        p.line(vw - marginX, vh - marginY, vw - marginX - 50, vh - marginY); // Horizontal line
        p.line(vw - marginX, vh - marginY, vw - marginX, vh - marginY - 50); // Vertical line

        // Draw the centered text
        p.noStroke();
        p.text("Fall 2024 Game Jam", vw / 2, vh / 2);
      };
    };

    // Only initialize p5 if it hasn't been initialized before
    if (!p5Instance.current) {
      p5Instance.current = new window.p5(sketch);
    }

    // Cleanup function to remove the p5 instance and avoid multiple canvases
    return () => {
      if (p5Instance.current) {
        p5Instance.current.remove();
        p5Instance.current = null; // Ensure it's null so it can be reinitialized
      }
    };
  }, []);

  return <div ref={sketchRef}></div>;
}