"use client";

import P5Sketch from "@/app/components/P5Sketch";
import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [brushColor, setBrushColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(10);

  const mySketch = (p) => {
    p.setup = () => {
      p.createCanvas(window.innerWidth * (3/4), window.innerHeight);
      p.background(220);
    };

    p.draw = () => {
      p.fill(brushColor);
      p.circle(p.pmouseX, p.pmouseY, brushSize);
    };

    p.windowResized = () => {
        p.resizeCanvas(window.innerWidth * (3/4), window.innerHeight);
    };

    p.keyPressed = async () => {
      if (p.key === "s") {
        const canvas = p.canvas;
        canvas.toBlob(async (blob) => {
          const formData = new FormData();
          formData.append("file", blob, "drawing.png");

          await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          alert("Drawing saved!");
        });
      }
    };
  };

  const bar = (p) => {
    p.setup = () => {
      p.createCanvas(window.innerWidth * (1/4), window.innerHeight);
      p.background(0);
    }

    p.windowResized = () => {
        p.resizeCanvas(window.innerWidth * (1/4), window.innerHeight);
    };
  }

  return (
    <main className="flex flex-row items-center justify-center min-h-screen">
      <Link href="/gallery" className="mt-4 underline text-blue-600">
        View Gallery →
      </Link>
      <P5Sketch sketch={bar} />
      <P5Sketch sketch={mySketch} />
    </main>
  );
}