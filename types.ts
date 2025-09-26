
export interface Cube {
  id: string;
  x: number;
  y: number;
  z: number;
  size: number;
  color: string;
}

export enum GenerationMode {
  Additive = 'ADDITIVE',
  Subtractive = 'SUBTRACTIVE',
}

export interface GeneratorParams {
  mode: GenerationMode;
  seed: number;
  basePillarWidth: number;
  basePillarDepth: number;
  basePillarHeight: number;
  iterations: number;
  minCubeSize: number;
  maxCubeSize: number;
  color: string;
}
