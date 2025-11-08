"use client";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import P5Sketch from "../components/P5Sketch";

export default function GalleryPage() {
  const [drawings, setDrawings] = useState([]);

  const fetchDrawings = async () => {
    const res = await fetch("/api/gallery", { cache: "no-store" });
    const data = await res.json();
    setDrawings(data);
  };

  useEffect(() => {
    fetchDrawings();
  }, []);

  const sketch = useCallback((p) => {
    
  })

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center p-8">
      
    </main>
  );
}
