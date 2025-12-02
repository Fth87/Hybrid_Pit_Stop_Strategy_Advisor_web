import React from 'react';
import clsx from 'clsx';
import { FaCloudShowersHeavy, FaCircleCheck, FaCircleExclamation } from 'react-icons/fa6';

interface AnalysisModulesProps {
  urgencyScore: number;
  scProb: number;
  regStatus: string;
  regIconType: 'check' | 'warn' | 'rain';
}

export function AnalysisModules({ urgencyScore, scProb, regStatus, regIconType }: AnalysisModulesProps) {
  const getRegIcon = () => {
    switch (regIconType) {
      case 'rain':
        return { icon: FaCloudShowersHeavy, color: 'text-blue-400' };
      case 'warn':
        return { icon: FaCircleExclamation, color: 'text-yellow-400 animate-pulse' };
      default:
        return { icon: FaCircleCheck, color: 'text-green-500' };
    }
  };

  const regIcon = getRegIcon();
  const RegIconComponent = regIcon.icon;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Module 1: Urgency (Fuzzy Logic Output) */}
      <div className="glass-panel p-4 border-t-2 border-orange-500">
        <div className="flex justify-between items-end mb-2">
          <h4 className="text-[10px] font-bold text-gray-400 uppercase">Urgency (Fuzzy)</h4>
          <span className="text-xl font-black text-orange-500">{urgencyScore.toFixed(1)}</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2 mb-1 overflow-hidden">
          <div className="h-full bg-orange-500 transition-all duration-1000" style={{ width: `${(urgencyScore / 10) * 100}%` }}></div>
        </div>
      </div>

      {/* Module 2: SC Risk (Bayesian Output) */}
      <div className="glass-panel p-4 border-t-2 border-red-500">
        <div className="flex justify-between items-end mb-2">
          <h4 className="text-[10px] font-bold text-gray-400 uppercase">SC Risk (Bayesian)</h4>
          <span className="text-xl font-black text-red-500">{(scProb * 100).toFixed(0)}%</span>
        </div>
        <div className="flex justify-between px-1 gap-1">
          <span
            className={clsx('h-3 w-3 rounded-full bg-gray-700 transition-all', {
              'bg-yellow-400 shadow-[0_0_8px_#ffeb3b] animate-pulse': scProb <= 0.3,
            })}
          ></span>
          <span
            className={clsx('h-3 w-3 rounded-full bg-gray-700 transition-all', {
              'bg-yellow-400 shadow-[0_0_8px_#ffeb3b] animate-pulse': scProb > 0.3 && scProb <= 0.6,
            })}
          ></span>
          <span
            className={clsx('h-3 w-3 rounded-full bg-gray-700 transition-all', {
              'bg-yellow-400 shadow-[0_0_8px_#ffeb3b] animate-pulse': scProb > 0.6,
            })}
          ></span>
        </div>
      </div>

      {/* Module 3: Regulation (FOL Output) */}
      <div className="glass-panel p-4 border-t-2 border-purple-500">
        <div className="flex justify-between items-end mb-2">
          <h4 className="text-[10px] font-bold text-gray-400 uppercase">Regulation (FOL)</h4>
          <RegIconComponent className={`text-xl ${regIcon.color}`} />
        </div>
        <div className={`text-xs font-bold ${regIcon.color.replace('animate-pulse', '')}`}>{regStatus}</div>
      </div>
    </div>
  );
}
