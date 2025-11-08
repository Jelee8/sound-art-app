// components/ColorWheel.js
"use client";
import { useRef, useEffect, useState } from "react";

export default function ColorWheel({ onColorChange }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  const [selectedColor, setSelectedColor] = useState("#ff0000");
  const [markerPos, setMarkerPos] = useState(null); // { x: cssPx, y: cssPx } or null

  const CSS_SIZE = 300;      // visible size in CSS pixels
  const INNER_RADIUS_CSS = 80; // hollow inner radius in CSS pixels

  // Draw wheel once (or when size changes)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const backingSize = Math.floor(CSS_SIZE * dpr);

    // Set backing store size for crisp drawing, then style to CSS size
    canvas.width = backingSize;
    canvas.height = backingSize;
    canvas.style.width = `${CSS_SIZE}px`;
    canvas.style.height = `${CSS_SIZE}px`;

    const ctx = canvas.getContext("2d");
    const outerRadius = backingSize / 2;
    const innerRadius = INNER_RADIUS_CSS * dpr; // convert inner radius to backing pixels

    // Create image data once for speed
    const img = ctx.createImageData(backingSize, backingSize);
    const data = img.data;

    for (let j = 0; j < backingSize; j++) {
      for (let i = 0; i < backingSize; i++) {
        const dx = i - outerRadius;
        const dy = j - outerRadius;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= outerRadius && dist >= innerRadius) {
          // angle in degrees [0,360)
          const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 180;
          const hue = angle / 360;
          const sat = 1; // full saturation on the ring
          const light = 0.5;

          const [r, g, b] = hslToRgb(hue, sat, light);
          const idx = (j * backingSize + i) * 4;
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
          data[idx + 3] = 255;
        } else {
          // transparent / background
          const idx = (j * backingSize + i) * 4;
          data[idx] = 0;
          data[idx + 1] = 0;
          data[idx + 2] = 0;
          data[idx + 3] = 0;
        }
      }
    }

    ctx.putImageData(img, 0, 0);
  }, []); // empty deps -> draw once

  // Handle click (and compute marker pos & hex color)
  const handleClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect(); // CSS pixels
    const cssX = e.clientX - rect.left; // CSS px within canvas (for marker)
    const cssY = e.clientY - rect.top;

    const dpr = window.devicePixelRatio || 1;
    // convert to backing pixels for color reading
    const x = Math.round(cssX * dpr);
    const y = Math.round(cssY * dpr);

    const backingSize = canvas.width; // already set
    const center = backingSize / 2;
    const dx = x - center;
    const dy = y - center;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const innerRadius = INNER_RADIUS_CSS * dpr;
    const outerRadius = backingSize / 2;

    if (dist < innerRadius || dist > outerRadius) {
      // click outside ring/hole -> ignore
      return;
    }

    const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 180; // 0-360
    const hue = angle / 360;
    const sat = 1;
    const light = 0.5;

    const [r, g, b] = hslToRgb(hue, sat, light);
    const hex = rgbToHex(r, g, b);

    setSelectedColor(hex);
    onColorChange?.(hex);

    // Marker position should be placed using CSS pixels (so set cssX / cssY)
    setMarkerPos({ x: cssX, y: cssY });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div
        ref={containerRef}
        style={{
          position: "relative",
          width: CSS_SIZE,
          height: CSS_SIZE,
          userSelect: "none",
        }}
      >
        <canvas
          ref={canvasRef}
          onClick={handleClick}
          style={{
            display: "block",
            borderRadius: "50%",
            cursor: "crosshair",
          }}
        />
        {/* Marker layered on top */}
        {markerPos && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: markerPos.x,
              top: markerPos.y,
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                border: "3px solid white",
                boxShadow: "0 0 0 1px rgba(0,0,0,0.25)",
                backgroundColor: selectedColor,
              }}
            />
          </div>
        )}
      </div>

      <div
        style={{
          width: 120,
          height: 48,
          borderRadius: 8,
          border: "1px solid #ccc",
          backgroundColor: selectedColor,
        }}
      />
      <div style={{ fontFamily: "monospace" }}>{selectedColor}</div>
    </div>
  );
}

/* ---------- Helpers ---------- */

function hslToRgb(h, s, l) {
  // h in [0,1], s in [0,1], l in [0,1]
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map((n) => {
        const s = n.toString(16);
        return s.length === 1 ? "0" + s : s;
      })
      .join("")
  );
}
