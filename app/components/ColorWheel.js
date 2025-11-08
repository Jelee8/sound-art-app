"use client";

import { useEffect, useState } from 'react';

function ColorWheel({ brushColor, onColorChange }) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log('ColorWheel mounting...');
        // Import the web component registration code here
        import('@spectrum-web-components/color-wheel/sp-color-wheel.js').then(() => {
            console.log('Color wheel component loaded successfully');
            setIsLoaded(true);
        }).catch((error) => {
            console.error('Failed to load color wheel:', error);
            setError(error.message);
            setIsLoaded(true); // Still set to true to show the component
        });
    }, []);

    if (!isLoaded) {
        return <div>Loading color wheel...</div>;
    }

    if (error) {
        return <div>Error loading color wheel: {error}</div>;
    }

    return(
        <sp-color-wheel
            value={brushColor}
            color="#0000FF"
            oninput={(e) => {
                console.log('Color changed:', e.target.color);
                onColorChange(e.target.color);
            }}
            style={{ width: '200px', height: '200px', display: 'block' }}
        ></sp-color-wheel>
    )  
}

export default ColorWheel;