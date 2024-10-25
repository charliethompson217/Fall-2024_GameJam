import React, { useRef, useEffect } from 'react';

export default function Sketch() {
  const sketchRef = useRef();
  const p5Instance = useRef(null);

  useEffect(() => {
    // Calculate time elapsed since the start of the current 108-second window
    const getElapsedTime = () => {
      const now = Math.floor(Date.now() / 1000); // Current Unix time in seconds
      const startOfWindow = Math.floor(now / 108) * 108; // Start of the 108-second window
      return (now - startOfWindow) * 1000; // Difference in milliseconds
    };

    // Function for creating the sketch
    const sketch = (p) => {
      let vw = Math.min(document.documentElement.clientWidth, window.innerWidth);
      let vh = Math.min(document.documentElement.clientHeight, window.innerHeight);
      const boxWidth = vw / 8;
      const boxHeight = vh / 5;

      // Box speed
      let xSpeed = 3;
      let ySpeed = 2;
      const frameRate = 60;

      // Bounce count
      let bounceCount = 0;

      // Calculate initial position based on elapsed time
      const elapsedMs = getElapsedTime();
      const totalFrames = (elapsedMs / 1000) * frameRate;

      // Initialize x and y positions based on elapsed time
      const initialX = (Math.floor(elapsedMs / 1000) % (vw - boxWidth));
      const initialY = (Math.floor(elapsedMs / 1000) % (vh - boxHeight));

      let x = initialX;
      let y = initialY;

      p.setup = () => {
        const canvas = p.createCanvas(vw, vh);
        canvas.parent(sketchRef.current);

        p.pixelDensity(3);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(20);
        p.fill(255);

        // Skip ahead in time to match the calculated frame position
        for (let i = 0; i < totalFrames; i++) {
          x += xSpeed;
          y += ySpeed;

          // Boundary check to simulate the bouncing effect
          if (x + boxWidth >= vw || x <= 0) {
            xSpeed *= -1;
            bounceCount++;
          }
          if (y + boxHeight >= vh || y <= 0) {
            ySpeed *= -1;
            bounceCount++;
          }
        }
      };

      p.draw = () => {
        p.background(0);

        // Current Unix time
        const unixTime = Math.floor(Date.now());

        // Calculate countdown timer (108 - seconds elapsed within the current 108-second window)
        const now = Math.floor(Date.now() / 1000);
        const countdown = 108 - (now % 108);

        // Move the box
        x += xSpeed;
        y += ySpeed;

        // Check for boundary collision and reverse direction if needed
        if (x + boxWidth >= vw || x <= 0) {
          xSpeed *= -1;
          bounceCount++;
        }
        if (y + boxHeight >= vh || y <= 0) {
          ySpeed *= -1;
          bounceCount++;
        }

        // Draw the box with a transparent outline
        p.noFill();
        p.stroke(255, 255, 255, 150);
        p.strokeWeight(2);
        p.rect(x, y, boxWidth, boxHeight);

        // Draw the viewport width and height at the top
        p.noStroke();
        p.fill(255);
        p.textSize(vw < 1000 ? 12 : 20);
        p.text(`${vw}x${vh}`, x + boxWidth / 2, y - (boxHeight / 4));

        // Draw the other text centered in the box
        p.text(new Date().toLocaleTimeString(), x + boxWidth / 2, y + (boxHeight / 4) - (boxHeight / 8));
        p.text(unixTime, x + boxWidth / 2, y + ((2 * boxHeight) / 4) - (boxHeight / 8));
        p.text(`${countdown}`, x + boxWidth / 2, y + ((3 * boxHeight) / 4) - (boxHeight / 8));
        p.fill(255, 0, 0);
        p.text(`${bounceCount}`, x + boxWidth / 2, y + ((4 * boxHeight) / 4) - (boxHeight / 8));
      };

      p.windowResized = () => {
        vw = Math.min(document.documentElement.clientWidth, window.innerWidth);
        vh = Math.min(document.documentElement.clientHeight, window.innerHeight);
        p.resizeCanvas(vw, vh);
      };
    };

    if (!p5Instance.current) {
      p5Instance.current = new window.p5(sketch);
    }

    return () => {
      if (p5Instance.current) {
        p5Instance.current.remove();
        p5Instance.current = null;
      }
    };
  }, []);

  return <div ref={sketchRef}></div>;
}