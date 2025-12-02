import React from 'react';
import { FaFlagCheckered, FaArrowRightToBracket, FaChessKnight } from 'react-icons/fa6';

interface StrategyDecisionProps {
  decision: string;
  decisionReason: string;
  decisionClass: string;
}

export function StrategyDecision({ decision, decisionReason, decisionClass }: StrategyDecisionProps) {
  return (
    <div className="glass-panel p-0 overflow-hidden relative min-h-[220px] flex flex-col">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>

      <div className="bg-black/40 p-3 border-b border-gray-700 flex justify-between items-center">
        <h3 className="font-bold text-gray-300 text-sm flex items-center gap-2">
          <FaChessKnight /> STRATEGY RECOMMENDATION
        </h3>
        <span className="font-mono text-xs text-gray-500">READY</span>
      </div>

      <div className="p-6 flex-grow flex flex-col md:flex-row items-center justify-center gap-8 relative z-0">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -z-10 text-gray-800 opacity-20">
          <FaFlagCheckered size={160} />
        </div>

        <div className="text-center md:text-left flex-1 z-10">
          <div className="text-xs text-gray-400 mb-1 uppercase tracking-widest">Advisor Decision</div>
          <div className={`font-black text-4xl md:text-5xl uppercase leading-none text-shadow-lg ${decisionClass}`}>{decision}</div>
          <div className="text-lg text-gray-400 mt-2 font-light italic">{decisionReason}</div>
        </div>

        <div className="hidden md:flex w-24 h-24 rounded-full border-4 border-gray-600 items-center justify-center text-gray-600">
          <FaArrowRightToBracket size={40} />
        </div>
      </div>
    </div>
  );
}
