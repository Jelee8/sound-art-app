"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import P5Sketch from "./components/P5Sketch";
import ColorWheel from "./components/ColorWheel";

export default function DrawPage() {
  // Brush state
  const [brushColor, setBrushColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(10);

  const [drawings, setDrawings] = useState([]);
  const [selectedFile, setSelectedFile] = useState("");

  let strokes = [];
  let undos = [];

  // Ref to store the p5 instance
  const p5Ref = useRef(null);

  useEffect(() => {
    async function fetchDrawings() {
      try {
        const res = await fetch("/api/drawing");
        if (!res.ok) throw new Error("Failed to load drawings");
        const data = await res.json();
        setDrawings(data);
      } catch (err) {
        console.error(err);
      }
  }
    fetchDrawings();
  }, []);

  // Drawing sketch
  const drawingSketch = useCallback((p) => {
    let color = brushColor;
    let size = brushSize;
    let drawing = false;

    p.setup = () => {
      p.createCanvas(window.innerWidth, window.innerHeight);
      p.background(255);
    };

    p.draw = () => {};

    p.mouseDragged = () => {
      if(drawing){
        const stroke = {
        x1: p.pmouseX,
        y1: p.pmouseY,
        x2: p.mouseX,
        y2: p.mouseY,
        color: color,
        size: size
      };
      strokes[strokes.length - 1].push(stroke);

      p.stroke(color);
      p.strokeWeight(size);
      p.line(p.pmouseX, p.pmouseY, p.mouseX, p.mouseY);
      }
    };

    p.mousePressed = async () => {
      strokes.push([]);
      drawing = true;
    }

    p.mouseReleased = async () => {
      drawing = false;
    }

    p.keyPressed = async () => {
      if (p.key === "s") {
        const filename = `drawing-${Date.now()}.json`;
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ strokes, filename }),
        });
        if (res.ok) {
          alert("Drawing saved!");
          const updated = await fetch("/api/drawing");
          setDrawings(await updated.json());
        } else {
          alert("Error saving drawing.");
        }
      }
      else if (p.key === "u"){
        let undo = strokes.pop();
        if(undo !== undefined){
          undos.push(undo);
          // Redraw entire canvas
          p.background(255);
          strokes.forEach((strokeGroup) => {
            strokeGroup.forEach((stroke) => {
              p.stroke(stroke.color);
              p.strokeWeight(stroke.size);
              p.line(stroke.x1, stroke.y1, stroke.x2, stroke.y2);
            });
          });
        }
      }
      else if (p.key === "r"){
        let redo = undos.pop();
        if(redo !== undefined){
          // Add back the stroke group
          strokes.push(redo);
          // Draw the entire stroke group
          redo.forEach((stroke) => {
            p.stroke(stroke.color);
            p.strokeWeight(stroke.size);
            p.line(stroke.x1, stroke.y1, stroke.x2, stroke.y2);
          });
        }
      }
    };

    p.loadDrawing = async (filename) => {
      try {
        const res = await fetch(`/api/drawing/${encodeURIComponent(filename)}`);
        if (!res.ok) throw new Error("Failed to load drawing");

        const data = await res.json();

        const p = p5Ref.current;
        if (p) {
          p.background(255);
          data.strokes.forEach((s) => {
            s.forEach((l) => {
              p.stroke(l.color);
              p.strokeWeight(l.size);
              p.line(l.x1, l.y1, l.x2, l.y2);
            });
          });
        }

        strokes = data.strokes; // Keep editable
      } catch (err) {
        console.error(err);
        alert("Failed to load drawing.");
      }
    };

    p.windowResized = () => {
      p.resizeCanvas(window.innerWidth, window.innerHeight);
    };

    // Methods to update brush dynamically
    p.setBrush = (newColor, newSize) => {
      color = newColor;
      size = newSize;
    };

    p5Ref.current = p; // save instance
  }, []);

  // Toolbar handlers
  const handleColorChange = (color) => {
    setBrushColor(color);
    if (p5Ref.current) p5Ref.current.setBrush(color, brushSize);
  };

  const handleSizeChange = (size) => {
    setBrushSize(size);
    if (p5Ref.current) p5Ref.current.setBrush(brushColor, size);
  };

  async function handleLoad() {
    if(p5Ref.current && selectedFile){
      await p5Ref.current.loadDrawing(selectedFile);
    }
  }

  //undo
  const undo = () => {
    if(!p5InstanceRef.current || undoStack.current.length === 0){
      return;
    }
    const p = p5InstanceRef.current;
    const lastState = undoStack.current.pop();
    redoStack.current.push(p.canvas.toDataURL());
    const prevState = undoStack.current[undoStack.current.length - 1];
    const img = new Image();
    img.src = prevState;
    img.onload = () => {
      p.clear();
      p.image(img, 0, 0);
    };
  };

  //redo
  const redo = () => {
    if(!p5InstanceRef.current || redoStack.current.length === 0){
      return;
    }
    const p = p5InstanceRef.current;
    const redoState = redoStack.current.pop();
    undoStack.current.push(p.canvas.toDataURL());
    const prevState = undoStack.current[undoStack.current.length - 1];
    const img = new Image();
    img.src = redoState;
    img.onload = () => {
      p.clear();
      p.image(img, 0, 0);
    };
  }

  return (
    <div className="flex flex-row">
      <ColorWheel brushColor={brushColor} onColorChange={handleColorChange} />
      {/* Toolbar */}
      <div className="flex flex-col">
        <div
          style={{
            height: "auto",
            display: "flex",
            alignItems: "center",
            gap: 20,
            padding: 10,
            background: "#000",
          }}
        >
          {/* Colors */}
          {["#000000", "#FF0000", "#00FF00", "#0000FF"].map((c) => (
            <button
              key={c}
              style={{
                background: c,
                width: 40,
                height: 40,
                border: brushColor === c ? "3px solid #555" : "1px solid #999",
              }}
              onClick={() => handleColorChange(c)}
            />
          ))}

          {/* Brush Sizes */}
          {[5, 10, 20, 40].map((s) => (
            <button
              key={s}
              style={{
                width: s + 10,
                height: s + 10,
                borderRadius: "50%",
                background: "#555",
                border: brushSize === s ? "3px solid #333" : "1px solid #999",
              }}
              onClick={() => handleSizeChange(s)}
            />
          ))}

          {/* Clear Button */}
          <button
            style={{ padding: "5px 10px", marginLeft: 20 }}
            onClick={() => {
              if (p5Ref.current) p5Ref.current.background(255);
              strokes = [];
            }}
          >
            Clear
          </button>
          {/* Dropdown to load saved drawings */}
          <select
            className="text-black bg-white p-1 mb-2"
            value={selectedFile}
            onChange={(e) => setSelectedFile(e.target.value)}
          >
            <option value="">Select drawing...</option>
            {drawings.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>

          <button
            className="bg-blue-500 rounded px-3 py-1 mb-2"
            onClick={handleLoad}
          >
            Load Drawing
          </button>
        </div>
        <Link href="/gallery" className="mt-4 underline text-blue-600">
          View Gallery →
        </Link>
      </div>

      {/* Drawing Canvas */}
      <P5Sketch sketch={drawingSketch} />
    </div>
  );
}
