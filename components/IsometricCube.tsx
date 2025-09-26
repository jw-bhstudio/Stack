
import React, { useMemo } from 'react';
import type { Cube } from '../types';

interface IsometricCubeProps extends Omit<Cube, 'id'> {
  project: (x: number, y: number, z: number) => { x: number; y: number };
}

// Helper to darken a hex color
const shadeColor = (hex: string, percent: number): string => {
    try {
        let R = parseInt(hex.substring(1, 3), 16);
        let G = parseInt(hex.substring(3, 5), 16);
        let B = parseInt(hex.substring(5, 7), 16);

        R = Math.floor(R * (1 + percent));
        G = Math.floor(G * (1 + percent));
        B = Math.floor(B * (1 + percent));

        R = (R < 255) ? R : 255;  
        G = (G < 255) ? G : 255;  
        B = (B < 255) ? B : 255;  

        const RR = ((R.toString(16).length === 1) ? "0" + R.toString(16) : R.toString(16));
        const GG = ((G.toString(16).length === 1) ? "0" + G.toString(16) : G.toString(16));
        const BB = ((B.toString(16).length === 1) ? "0" + B.toString(16) : B.toString(16));

        return "#" + RR + GG + BB;
    } catch (error) {
        return hex; // Return original color on error
    }
};

export const IsometricCube: React.FC<IsometricCubeProps> = ({ x, y, z, size, color, project }) => {
  const { faces, colors } = useMemo(() => {
    const s = size;
    // Define the 8 corners of the cube
    const corners = [
      { x, y, z },           // 0: bottom-back-left
      { x: x + s, y, z },     // 1: bottom-front-left
      { x, y: y + s, z },     // 2: bottom-back-right
      { x: x + s, y: y + s, z }, // 3: bottom-front-right
      { x, y, z: z + s },     // 4: top-back-left
      { x: x + s, y, z: z + s }, // 5: top-front-left
      { x, y: y + s, z: z + s }, // 6: top-back-right
      { x: x + s, y: y + s, z: z + s }, // 7: top-front-right
    ];
    
    const p = corners.map(c => project(c.x, c.y, c.z));

    const facePaths = {
      // Top face (z = z + s)
      top: `M ${p[4].x} ${p[4].y} L ${p[5].x} ${p[5].y} L ${p[7].x} ${p[7].y} L ${p[6].x} ${p[6].y} Z`,
      // Left face (y = y + s), visible from front-left
      left: `M ${p[2].x} ${p[2].y} L ${p[3].x} ${p[3].y} L ${p[7].x} ${p[7].y} L ${p[6].x} ${p[6].y} Z`,
      // Right face (x = x + s), visible from front-right
      right: `M ${p[1].x} ${p[1].y} L ${p[3].x} ${p[3].y} L ${p[7].x} ${p[7].y} L ${p[5].x} ${p[5].y} Z`,
    };

    const faceColors = {
        top: color,
        left: shadeColor(color, -0.15),
        right: shadeColor(color, -0.30),
    };

    return { faces: facePaths, colors: faceColors };
  }, [x, y, z, size, color, project]);

  return (
    <g>
      <path d={faces.top} fill={colors.top} />
      <path d={faces.left} fill={colors.left} />
      <path d={faces.right} fill={colors.right} />
    </g>
  );
};
