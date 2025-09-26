import React, { useState } from 'react';
import type { GeneratorParams } from '../types';
import { GenerationMode } from '../types';

interface ControlsProps {
  params: GeneratorParams;
  setParams: React.Dispatch<React.SetStateAction<GeneratorParams>>;
  onRegenerate: () => void;
  onCopySVG: () => void;
}

const SliderWithInput: React.FC<{
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    onChange: (value: number) => void;
}> = ({ label, value, min, max, step = 1, onChange }) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let num = parseInt(e.target.value, 10);
        if (isNaN(num)) {
            // Allow empty input without changing state
            return;
        }
        if (num > max) num = max;
        // Don't enforce min here to allow typing, e.g., "1" then "0" for 10
        onChange(num);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
         let num = parseInt(e.target.value, 10);
         if (isNaN(num) || num < min) {
            onChange(min);
         }
    }

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(Number(e.target.value));
    };

    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
            <label htmlFor={label} className="text-sm font-medium text-gray-300">
              {label}
            </label>
            <input
                type="number"
                value={value.toString()}
                min={min}
                max={max}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className="w-20 bg-gray-800 border border-gray-600 rounded-md p-1 text-sm text-white text-center focus:ring-violet-500 focus:border-violet-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
        </div>
        <input
          id={label}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>
    );
};

const NumberInput: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}> = ({ label, value, min, max, onChange }) => (
    <div>
        <label htmlFor={label} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <input
            id={label}
            type="number"
            min={min}
            max={max}
            value={value}
            onChange={(e) => {
                let num = parseInt(e.target.value, 10);
                if (isNaN(num)) num = min;
                if (num > max) num = max;
                if (num < min) num = min;
                onChange(num);
            }}
            className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-violet-500 focus:border-violet-500"
        />
    </div>
);


const ModeToggle: React.FC<{
    mode: GenerationMode;
    onChange: (mode: GenerationMode) => void;
}> = ({ mode, onChange }) => (
    <div className="flex w-full bg-gray-800 rounded-lg p-1">
        <button
            onClick={() => onChange(GenerationMode.Additive)}
            className={`w-1/2 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${mode === GenerationMode.Additive ? 'bg-violet-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
        >
            Additive
        </button>
        <button
            onClick={() => onChange(GenerationMode.Subtractive)}
            className={`w-1/2 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${mode === GenerationMode.Subtractive ? 'bg-violet-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
        >
            Subtractive
        </button>
    </div>
);


export const Controls: React.FC<ControlsProps> = ({ params, setParams, onRegenerate, onCopySVG }) => {
  const [copyStatus, setCopyStatus] = useState('Copy SVG');

  const handleCopyClick = () => {
    onCopySVG();
    setCopyStatus('Copied!');
    setTimeout(() => {
        setCopyStatus('Copy SVG');
    }, 2000);
  };

  const handleMinMaxChange = (minOrMax: 'min' | 'max', value: number) => {
    setParams(p => {
        const newMin = minOrMax === 'min' ? value : p.minCubeSize;
        const newMax = minOrMax === 'max' ? value : p.maxCubeSize;
        return {
            ...p,
            minCubeSize: Math.min(newMin, newMax),
            maxCubeSize: Math.max(newMin, newMax),
        };
    });
  };

  const handleModeChange = (newMode: GenerationMode) => {
    setParams(p => {
        if (newMode === GenerationMode.Additive) {
            return {
                ...p,
                mode: newMode,
                iterations: 1000,
                minCubeSize: 1,
                maxCubeSize: 20,
                color: '#b4b4b4',
            };
        } else { // Subtractive
            return {
                ...p,
                mode: newMode,
                basePillarWidth: 30,
                basePillarDepth: 30,
                basePillarHeight: 100,
                iterations: 500,
                minCubeSize: 1,
                maxCubeSize: 20,
                color: '#b4b4b4',
            };
        }
    });
};

  return (
    <div className="space-y-6 flex flex-col h-full">
        <div className="flex-grow space-y-6 overflow-y-auto pr-2">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-white">Stack 叠盒子</h1>
                <p className="text-sm text-gray-400">craft complex isometric cube patterns</p>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-700">
                <h2 className="text-lg font-semibold text-violet-300">Generation Mode</h2>
                 <ModeToggle 
                    mode={params.mode}
                    onChange={handleModeChange}
                />
            </div>
      
            <div className="space-y-4 pt-4 border-t border-gray-700">
                <h2 className="text-lg font-semibold text-violet-300">Core Parameters</h2>
                <SliderWithInput
                    label="Seed"
                    value={params.seed}
                    min={0}
                    max={10000}
                    onChange={(val) => setParams(p => ({ ...p, seed: val }))}
                />
                <SliderWithInput
                    label={params.mode === GenerationMode.Additive ? 'Number of Cubes' : 'Number of Removals'}
                    value={params.iterations}
                    min={10}
                    max={params.mode === GenerationMode.Additive ? 2000 : 500}
                    onChange={(val) => setParams(p => ({ ...p, iterations: val }))}
                />
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-700">
                <h2 className="text-lg font-semibold text-violet-300">Cube Sizing</h2>
                 <div className="grid grid-cols-2 gap-4">
                     <NumberInput
                        label="Min Cube Size"
                        value={params.minCubeSize}
                        min={1}
                        max={params.maxCubeSize}
                        onChange={(val) => handleMinMaxChange('min', val)}
                    />
                     <NumberInput
                        label="Max Cube Size"
                        value={params.maxCubeSize}
                        min={params.minCubeSize}
                        max={20}
                        onChange={(val) => handleMinMaxChange('max', val)}
                    />
                 </div>
            </div>

            {params.mode === GenerationMode.Subtractive && (
                 <div className="space-y-4 pt-4 border-t border-gray-700">
                    <h2 className="text-lg font-semibold text-violet-300">Pillar Dimensions</h2>
                    <SliderWithInput
                        label="Pillar Width"
                        value={params.basePillarWidth}
                        min={4}
                        max={50}
                        onChange={(val) => setParams(p => ({ ...p, basePillarWidth: val }))}
                    />
                    <SliderWithInput
                        label="Pillar Depth"
                        value={params.basePillarDepth}
                        min={4}
                        max={50}
                        onChange={(val) => setParams(p => ({ ...p, basePillarDepth: val }))}
                    />
                     <SliderWithInput
                        label="Pillar Height"
                        value={params.basePillarHeight}
                        min={10}
                        max={200}
                        onChange={(val) => setParams(p => ({ ...p, basePillarHeight: val }))}
                    />
                </div>
            )}
             <div className="space-y-2 pt-4 border-t border-gray-700">
                <label htmlFor="color-picker" className="text-lg font-semibold text-violet-300">Base Color</label>
                <input
                    id="color-picker"
                    type="color"
                    value={params.color}
                    onChange={(e) => setParams(p => ({ ...p, color: e.target.value }))}
                    className="w-full h-10 p-1 bg-gray-700 border border-gray-600 rounded-lg cursor-pointer"
                />
             </div>
        </div>

        <div className="pt-4 border-t border-gray-700 space-y-3 shrink-0">
             <button
                onClick={handleCopyClick}
                disabled={copyStatus === 'Copied!'}
                className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-green-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
                {copyStatus}
            </button>
            <button
                onClick={onRegenerate}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105"
            >
                Regenerate
            </button>
        </div>
    </div>
  );
};