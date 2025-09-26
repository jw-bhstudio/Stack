
import React, { useState, useCallback, useRef } from 'react';
import { Controls } from './components/Controls';
import { IsometricCanvas } from './components/IsometricCanvas';
import { useCubeGenerator } from './hooks/useCubeGenerator';
import { type GeneratorParams, GenerationMode } from './types';

const App: React.FC = () => {
  const [params, setParams] = useState<GeneratorParams>({
    mode: GenerationMode.Additive,
    seed: Math.floor(Math.random() * 1000),
    basePillarWidth: 30,
    basePillarDepth: 30,
    basePillarHeight: 100,
    iterations: 1000,
    minCubeSize: 1,
    maxCubeSize: 20,
    color: '#b4b4b4',
  });

  const svgRef = useRef<SVGSVGElement>(null);
  const cubes = useCubeGenerator(params);
  
  const handleRegenerate = useCallback(() => {
    setParams(p => ({ ...p, seed: Math.floor(Math.random() * 10000) }));
  }, []);

  const handleCopySVG = useCallback(() => {
    if (svgRef.current) {
      const svgDoctype = '<?xml version="1.0" standalone="no"?>\r\n';
      const svgData = new XMLSerializer().serializeToString(svgRef.current);
      navigator.clipboard.writeText(svgDoctype + svgData).catch(err => {
        console.error('Failed to copy SVG: ', err);
        alert('Failed to copy SVG to clipboard.');
      });
    }
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen bg-gray-900 overflow-hidden">
      <aside className="w-full md:w-80 lg:w-96 bg-gray-900/80 backdrop-blur-sm border-r border-gray-700/50 p-6 overflow-y-auto">
        <Controls params={params} setParams={setParams} onRegenerate={handleRegenerate} onCopySVG={handleCopySVG} />
      </aside>
      <main className="flex-1 flex items-center justify-center bg-black/10 p-4">
        <IsometricCanvas cubes={cubes} ref={svgRef} />
      </main>
    </div>
  );
};

export default App;
