"use client";

import { useEffect, useRef } from "react";

export default function P5Sketch({ sketch }) {
  const containerRef = useRef(null);
  const p5InstanceRef = useRef(null); // store real instance here

  useEffect(() => {
    let mounted = true;

    // Dynamically import p5 only on client
    import("p5").then(({ default: P5 }) => {
      if (!mounted) return;

      // ✅ This returns the actual p5 instance
      p5InstanceRef.current = new P5(sketch, containerRef.current);
    });

    // ✅ Cleanup on unmount
    return () => {
      mounted = false;
      if (p5InstanceRef.current && p5InstanceRef.current.remove) {
        p5InstanceRef.current.remove();
      }
    };
  }, [sketch]);

  return <div ref={containerRef} />;
}