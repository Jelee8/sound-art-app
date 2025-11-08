"use client";

import P5Sketch from "@/components/P5Sketch";

export default function Home() {
  const mySketch = (p) => {
    let x = 0;

    p.setup = () => {
      p.createCanvas(window.innerWidth, window.innerHeight);
      p.background(220);
    };

    p.draw = () => {
      p.fill(0);
      p.circle(p.mouseX, p.mouseY, 30);
    };

    p.windowResized = () => {
        p.resizeCanvas(window.innerWidth, window.innerHeight);
      };
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <P5Sketch sketch={mySketch} />
    </main>
  );
}