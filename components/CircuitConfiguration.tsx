import React from 'react';
import { FaMapLocationDot, FaChevronDown, FaRoad, FaTriangleExclamation } from 'react-icons/fa6';
import clsx from 'clsx';
import { Circuit } from '@/types';
import { CIRCUITS } from '@/constants';

interface CircuitConfigurationProps {
  selectedCircuitIdx: number | null;
  onCircuitChange: (idx: number) => void;
  currentCircuit: Circuit | null;
}

export function CircuitConfiguration({ selectedCircuitIdx, onCircuitChange, currentCircuit }: CircuitConfigurationProps) {
  return (
    <div className="glass-panel p-5 f1-border-left relative">
      <h2 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
        <FaMapLocationDot className="text-red-600" /> Circuit Configuration
      </h2>

      <div className="mb-4 relative">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 block">Grand Prix Venue</label>
        <div className="relative">
          <select className="f1-input-base w-full p-2 rounded font-mono text-sm appearance-none cursor-pointer" onChange={(e) => onCircuitChange(Number(e.target.value))} value={selectedCircuitIdx ?? ''}>
            <option value="" disabled>
              -- Select Circuit --
            </option>
            {CIRCUITS.map((c, idx) => (
              <option key={idx} value={idx}>
                {c.country} - {c.venue}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400">
            <FaChevronDown className="text-xs" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-1">
        <div className="bg-gray-800/50 p-3 rounded border border-gray-700">
          <div className="text-[10px] text-gray-400 uppercase mb-1">Track Type</div>
          <div className="font-bold text-white text-sm flex items-center gap-2">
            <FaRoad className="text-gray-500" />
            <span>{currentCircuit?.type || '-'}</span>
          </div>
        </div>
        <div className="bg-gray-800/50 p-3 rounded border border-gray-700">
          <div className="text-[10px] text-gray-400 uppercase mb-1">Hist. SC Risk</div>
          <div
            className={clsx('font-bold text-sm flex items-center gap-2', {
              'text-red-500': currentCircuit?.sc_risk === 'High',
              'text-yellow-500': currentCircuit?.sc_risk === 'Medium',
              'text-white': !currentCircuit,
            })}
          >
            <FaTriangleExclamation className="text-gray-500" />
            <span>{currentCircuit?.sc_risk || '-'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
