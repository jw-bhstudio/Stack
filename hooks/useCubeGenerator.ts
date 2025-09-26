import { useMemo } from 'react';
import type { Cube, GeneratorParams } from '../types';
import { GenerationMode } from '../types';

// A simple seeded pseudo-random number generator (PRNG)
const mulberry32 = (a: number) => {
  return () => {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

const getBiasedRandomSize = (min: number, max: number, rand: () => number): number => {
    const range = max - min;
    // Squaring the random number biases the result towards the lower end (min)
    const biasedRandom = rand() * rand();
    return min + Math.floor(biasedRandom * (range + 1));
}


const generateSubtractive = (params: GeneratorParams, rand: () => number): Cube[] => {
    const { basePillarWidth, basePillarDepth, basePillarHeight, iterations, maxCubeSize, minCubeSize, color } = params;

    const voxels = Array.from({ length: basePillarWidth }, () =>
        Array.from({ length: basePillarDepth }, () =>
            new Array(basePillarHeight).fill(true)
        )
    );

    for (let i = 0; i < iterations; i++) {
        const removeSize = getBiasedRandomSize(minCubeSize, maxCubeSize, rand);
        const startX = Math.floor(rand() * (basePillarWidth - removeSize + 1));
        const startY = Math.floor(rand() * (basePillarDepth - removeSize + 1));
        const startZ = Math.floor(rand() * (basePillarHeight - removeSize + 1));

        for (let x = startX; x < startX + removeSize; x++) {
            for (let y = startY; y < startY + removeSize; y++) {
                for (let z = startZ; z < startZ + removeSize; z++) {
                    if (x >= 0 && x < basePillarWidth && y >= 0 && y < basePillarDepth && z >= 0 && z < basePillarHeight) {
                        voxels[x][y][z] = false;
                    }
                }
            }
        }
    }

    const result: Cube[] = [];
    const meshed = Array.from({ length: basePillarWidth }, () =>
        Array.from({ length: basePillarDepth }, () =>
            new Array(basePillarHeight).fill(false)
        )
    );

    for (let z = 0; z < basePillarHeight; z++) {
        for (let y = 0; y < basePillarDepth; y++) {
            for (let x = 0; x < basePillarWidth; x++) {
                if (voxels[x][y][z] && !meshed[x][y][z]) {
                    let maxS = 0;
                    // Greedy meshing algorithm
                    for (let s = 1; x + s <= basePillarWidth && y + s <= basePillarDepth && z + s <= basePillarHeight; s++) {
                        let canExpand = true;
                        for (let dx = 0; dx < s; dx++) {
                            for (let dy = 0; dy < s; dy++) {
                                for (let dz = 0; dz < s; dz++) {
                                    if (!voxels[x + dx][y + dy][z + dz] || meshed[x + dx][y + dy][z + dz]) {
                                        canExpand = false;
                                        break;
                                    }
                                }
                                if (!canExpand) break;
                            }
                            if (!canExpand) break;
                        }

                        if (canExpand) {
                            maxS = s;
                        } else {
                            break;
                        }
                    }

                    if (maxS > 0) {
                        result.push({ id: `${x},${y},${z}`, x, y, z, size: maxS, color });
                        for (let dx = 0; dx < maxS; dx++) {
                            for (let dy = 0; dy < maxS; dy++) {
                                for (let dz = 0; dz < maxS; dz++) {
                                    meshed[x + dx][y + dy][z + dz] = true;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    return result;
};

const generateAdditive = (params: GeneratorParams, rand: () => number): Cube[] => {
    const result: Cube[] = [];
    const occupied = new Set<string>();

    const firstCubeSize = getBiasedRandomSize(params.minCubeSize, params.maxCubeSize, rand);
    const firstCube: Cube = { id: '0,0,0', x: 0, y: 0, z: 0, size: firstCubeSize, color: params.color };
    result.push(firstCube);
    
    for (let x = 0; x < firstCubeSize; x++) {
        for (let y = 0; y < firstCubeSize; y++) {
            for (let z = 0; z < firstCubeSize; z++) {
                occupied.add(`${x},${y},${z}`);
            }
        }
    }

    for (let i = 1; i < params.iterations; i++) {
        let placed = false;
        let attempts = 0;
        while (!placed && attempts < 50) {
            const baseCube = result[Math.floor(rand() * result.length)];
            const newSize = getBiasedRandomSize(params.minCubeSize, params.maxCubeSize, rand);

            const face = Math.floor(rand() * 6);
            let newX=0, newY=0, newZ=0;

            switch (face) {
                case 0: newX = baseCube.x + baseCube.size; newY = baseCube.y; newZ = baseCube.z; break; // +X
                case 1: newX = baseCube.x - newSize; newY = baseCube.y; newZ = baseCube.z; break; // -X
                case 2: newX = baseCube.x; newY = baseCube.y + baseCube.size; newZ = baseCube.z; break; // +Y
                case 3: newX = baseCube.x; newY = baseCube.y - newSize; newZ = baseCube.z; break; // -Y
                case 4: newX = baseCube.x; newY = baseCube.y; newZ = baseCube.z + baseCube.size; break; // +Z
                case 5: newX = baseCube.x; newY = baseCube.y; newZ = baseCube.z - newSize; break; // -Z
            }
            
            let collision = false;
            for (let x = newX; x < newX + newSize; x++) {
                for (let y = newY; y < newY + newSize; y++) {
                    for (let z = newZ; z < newZ + newSize; z++) {
                        if (occupied.has(`${x},${y},${z}`)) {
                            collision = true;
                            break;
                        }
                    }
                    if (collision) break;
                }
                if (collision) break;
            }

            if (!collision) {
                const newCube: Cube = { id: `${newX},${newY},${newZ}`, x: newX, y: newY, z: newZ, size: newSize, color: params.color };
                result.push(newCube);
                for (let x = newX; x < newX + newSize; x++) {
                    for (let y = newY; y < newY + newSize; y++) {
                        for (let z = newZ; z < newZ + newSize; z++) {
                            occupied.add(`${x},${y},${z}`);
                        }
                    }
                }
                placed = true;
            }
            attempts++;
        }
    }
    return result;
};


export const useCubeGenerator = (params: GeneratorParams): Cube[] => {
  return useMemo(() => {
    const rand = mulberry32(params.seed);
    if (params.mode === GenerationMode.Additive) {
      return generateAdditive(params, rand);
    } else {
      return generateSubtractive(params, rand);
    }
  }, [params]);
};