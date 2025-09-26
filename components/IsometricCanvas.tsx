import React, { useMemo, useCallback, forwardRef } from 'react';
import type { Cube } from '../types';
import { IsometricCube } from './IsometricCube';

interface IsometricCanvasProps {
  cubes: Cube[];
}

const CELL_SIZE = 12; // Reduced size to fit larger structures
const TILE_WIDTH = CELL_SIZE * Math.sqrt(3);
const TILE_HEIGHT = CELL_SIZE;

export const IsometricCanvas = forwardRef<SVGSVGElement, IsometricCanvasProps>(({ cubes }, ref) => {
  
  const project = useCallback((x: number, y: number, z: number): { x: number, y: number } => {
    const screenX = (x - y) * (TILE_WIDTH / 2);
    const screenY = (x + y) * (TILE_HEIGHT / 2) - z * TILE_HEIGHT;
    return { x: screenX, y: -screenY }; // Invert Y to have Z pointing up
  }, []);

  const sortedCubes = useMemo(() => {
    return [...cubes].sort((a, b) => {
        const sumA = a.x + a.y + a.z;
        const sumB = b.x + b.y + b.z;
        if(sumA !== sumB) return sumA - sumB;

        if (a.z !== b.z) return a.z - b.z;
        if (a.y !== b.y) return a.y - b.y;
        return a.x - b.x;
    });
  }, [cubes]);

  const viewBox = useMemo(() => {
    if (cubes.length === 0) {
      return '-100 -100 200 200';
    }

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    cubes.forEach(cube => {
      const s = cube.size;
      const corners = [
        project(cube.x, cube.y, cube.z),
        project(cube.x + s, cube.y, cube.z),
        project(cube.x, cube.y + s, cube.z),
        project(cube.x, cube.y, cube.z + s),
        project(cube.x + s, cube.y + s, cube.z + s),
      ];
      corners.forEach(p => {
        minX = Math.min(minX, p.x - TILE_WIDTH);
        maxX = Math.max(maxX, p.x + TILE_WIDTH);
        minY = Math.min(minY, p.y - TILE_HEIGHT * 2);
        maxY = Math.max(maxY, p.y + TILE_HEIGHT);
      });
    });

    const width = maxX - minX;
    const height = maxY - minY;
    const padding = Math.max(width, height) * 0.1;

    return `${minX - padding} ${minY - padding} ${width + padding * 2} ${height + padding * 2}`;

  }, [cubes, project]);

  return (
    <div className="w-full h-full flex items-center justify-center">
        <svg viewBox={viewBox} className="w-full h-full" ref={ref}>
        {sortedCubes.map(cube => (
            <IsometricCube key={cube.id} {...cube} project={project} />
        ))}
        </svg>
    </div>
  );
});

IsometricCanvas.displayName = 'IsometricCanvas';