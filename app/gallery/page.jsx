"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function GalleryPage() {
  const [images, setImages] = useState([]);

  const fetchImages = async () => {
    const res = await fetch("/api/gallery", { cache: "no-store" });
    const data = await res.json();
    setImages(data);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center p-8">
      <div className="flex flex-row items-center">
        <Link href="/" className="mt-4 underline text-blue-600">
          Draw
        </Link>
        <h1 className="text-3xl font-bold mb-6 text-black">Your Gallery</h1>
      </div>

      {images.length === 0 && <p>No drawings yet — make one!</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {images.map((src) => (
          <div
            key={src}
            className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition relative"
          >
            <Image
              src={src}
              alt="Drawing"
              width={400}
              height={400}
              className="object-contain w-full h-auto"
            />
          </div>
        ))}
      </div>

      <button
        onClick={fetchImages}
        className="mt-8 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
      Refresh Gallery
      </button>
    </main>
  );
}
