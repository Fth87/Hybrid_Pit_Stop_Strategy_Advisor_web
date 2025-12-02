import React from 'react';
import { FaMicrochip, FaArrowRight } from 'react-icons/fa6';
import { FaTimes } from 'react-icons/fa';
import clsx from 'clsx';
import { Compound } from '@/types';
import { COMPOUND_BUTTONS } from '@/constants';
import { getChipStyle } from '@/utils/helpers';

interface TelemetryPanelProps {
  tireAge: number;
  onTireAgeChange: (age: number) => void;
  scActive: boolean;
  onScActiveChange: (active: boolean) => void;
  historyList: Compound[];
  onHistoryListChange: (list: Compound[]) => void;
  currentCompound: Compound;
  onCompoundChange: (compound: Compound) => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

export function TelemetryPanel({ tireAge, onTireAgeChange, scActive, onScActiveChange, historyList, onHistoryListChange, currentCompound, onCompoundChange, onAnalyze, isLoading }: TelemetryPanelProps) {
  const handleRemoveHistory = (idx: number) => {
    onHistoryListChange(historyList.filter((_, i) => i !== idx));
  };

  const handleAddHistory = (compound: Compound) => {
    onHistoryListChange([...historyList, compound]);
  };

  return (
    <div className="glass-panel p-5 f1-border-left relative">
      <h2 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
        <FaMicrochip className="text-red-600" /> Telemetry & Tire Data
      </h2>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 block">Tire Age</label>
          <input type="number" min="0" max="80" value={tireAge} onChange={(e) => onTireAgeChange(Number(e.target.value))} className="f1-input-base w-full p-2 rounded font-mono text-center font-bold" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 block">SC Status</label>
          <label className="flex items-center gap-2 cursor-pointer h-10 bg-gray-900/50 rounded px-2 border border-gray-700 hover:border-gray-500 transition-colors">
            <input type="checkbox" checked={scActive} onChange={(e) => onScActiveChange(e.target.checked)} className="w-4 h-4 text-yellow-400 rounded focus:ring-0 bg-gray-800 border-gray-600 accent-yellow-400" />
            <span className="text-xs font-bold text-gray-300">Safety Car Active</span>
          </label>
        </div>
      </div>

      {/* History */}
      <div className="mb-4">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 block">Tire History</label>
        <div className="f1-input-base p-2 rounded min-h-[40px] flex flex-wrap gap-1 mb-2 bg-gray-900/80">
          {historyList.length === 0 ? (
            <span className="text-gray-500 text-xs italic self-center px-1">No previous stints</span>
          ) : (
            historyList.map((tire, idx) => (
              <div key={idx} className={`inline-flex items-center padding px-2 py-0.5 rounded-full text-[10px] font-bold border ${getChipStyle(tire)}`}>
                {tire}
                <FaTimes className="ml-2 cursor-pointer hover:text-white" onClick={() => handleRemoveHistory(idx)} />
              </div>
            ))
          )}
        </div>

        <div className="flex gap-2 justify-between items-center bg-gray-800 p-2 rounded border border-gray-700">
          <span className="text-[10px] text-gray-400 uppercase font-bold mr-2">ADD STINT:</span>
          <div className="flex gap-2">
            {COMPOUND_BUTTONS.map((btn) => (
              <button key={btn.id} onClick={() => handleAddHistory(btn.id)} className={`w-7 h-7 rounded-full text-[10px] font-bold flex items-center justify-center border-2 hover:opacity-80 active:scale-90 transition ${btn.colorClass}`}>
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Compound Selector */}
      <div className="mb-4 text-center">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 block">Current Compound</label>
        <div className="flex justify-center gap-3 mt-2">
          {COMPOUND_BUTTONS.map((item) => (
            <div key={item.id} className="relative">
              <input type="radio" name="compound" id={item.id} value={item.id} checked={currentCompound === item.id} onChange={() => onCompoundChange(item.id)} className="absolute opacity-0 w-full h-full cursor-pointer z-10" />
              <div
                className={clsx(
                  'w-10 h-10 rounded-full border-4 bg-gray-900 flex items-center justify-center font-bold text-xs transition-transform duration-200',
                  item.colorClass,
                  currentCompound === item.id ? 'scale-110 opacity-100 ring-2 ring-white ring-opacity-20' : 'opacity-50 scale-90'
                )}
              >
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onAnalyze}
        disabled={isLoading}
        className="w-full bg-[#e10600] text-white font-bold text-lg uppercase tracking-wider p-3 rounded shadow-lg flex justify-center items-center gap-3 hover:bg-[#ff1e19] transition-all disabled:bg-gray-600 disabled:cursor-not-allowed group relative overflow-hidden"
      >
        {isLoading ? (
          <div className="w-6 h-6 border-4 border-white/20 border-l-white rounded-full animate-spin-custom"></div>
        ) : (
          <>
            <span>ANALYZE STRATEGY</span>
            <FaArrowRight />
          </>
        )}
      </button>
    </div>
  );
}
