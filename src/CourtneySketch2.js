import React, { useRef, useEffect } from 'react';

export default function Sketch() {
  const sketchRef = useRef();
  const p5Instance = useRef(null);

  useEffect(() => {
    // Function for creating the sketch
    let player;
    let fallingObjects = [];
    let score = 0;

    const sketch = (p) => {
      let vw = 700;
      let vh = 700;
      let playerImg, fallingObjectImg;

      p.setup = () => {
        const canvas = p.createCanvas(700, 700);
        canvas.parent(sketchRef.current);

        p.pixelDensity(3);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(20);
        p.fill(255);
        playerImg = p.loadImage('https://i.imgur.com/Bx1m3Yf.png');
        fallingObjectImg = p.loadImage('https://i.imgur.com/CdaoOXt.jpeg');
        player = new Player(p, vw, playerImg);
      };

      p.draw = () => {
        p.background(0); // Clear the screen each frame

        // Display and update the player
        player.display();
        player.move();

        // Create new falling objects at intervals
        if (p.frameCount % 60 === 0) {
          fallingObjects.push(new FallingObject(p, fallingObjectImg));
        }

        // Display, update, and check for collisions with each falling object
        for (let i = fallingObjects.length - 1; i >= 0; i--) {
          let obj = fallingObjects[i];
          obj.display();
          obj.update();

          // Check for collision
          if (obj.hits(player)) {
            score++;
            fallingObjects.splice(i, 1); // Remove the caught object
          } else if (obj.y > p.height) {
            fallingObjects.splice(i, 1); // Remove objects that fall off the screen
          }
        }

        // Display score
        p.fill(255);
        p.textSize(24);
        p.text("Score: " + score, 70, 30);
      };

      p.windowResized = () => {
        vw = Math.min(document.documentElement.clientWidth, window.innerWidth);
        vh = Math.min(document.documentElement.clientHeight, window.innerHeight);
        p.resizeCanvas(vw, vh);
      };

      // Set up key press and release functions
      p.keyPressed = () => {
        if (p.keyCode === p.LEFT_ARROW) {
          player.setDirection(-1);
        } else if (p.keyCode === p.RIGHT_ARROW) {
          player.setDirection(1);
        }
      };

      p.keyReleased = () => {
        player.setDirection(0);
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

// Player class
class Player {
  constructor(p, width, playerImg) {
    this.p = p;
    this.x = width / 2;
    this.size = 100;
    this.direction = 0;
    this.speed = 5;
    this.playerImg = playerImg;
  }

  display() {
    this.p.imageMode(this.p.CENTER);
    this.p.image(this.playerImg, this.x, this.p.height - 20, this.size, this.size);
  }

  move() {
    this.x += this.direction * this.speed;
    this.x = this.p.constrain(this.x, this.size / 2, this.p.width - this.size / 2);
  }

  setDirection(dir) {
    this.direction = dir;
  }
}

// FallingObject class
class FallingObject {
  constructor(p, img) {
    this.p = p;
    this.img = img;
    this.x = p.random(p.width);
    this.y = 0;
    this.size = 80;
    this.speed = 3;
  }

  display() {
    this.p.imageMode(this.p.CENTER);
    this.p.image(this.img, this.x, this.y, this.size, this.size);
  }

  update() {
    this.y += this.speed;
  }

  hits(player) {
    let d = this.p.dist(this.x, this.y, player.x, this.p.height - 20);
    return d < this.size / 2 + player.size / 2;
  }
}
