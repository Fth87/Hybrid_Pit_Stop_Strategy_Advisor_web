import React from 'react';
import { Circuit } from '@/types';

interface HeaderProps {
  currentCircuit: Circuit | null;
  currentTime: string;
}

export function Header({ currentCircuit, currentTime }: HeaderProps) {
  return (
    <header className="w-full bg-black border-b-4 border-red-600 py-4 px-6 flex justify-between items-center z-10 relative shadow-lg">
      <div className="flex items-center gap-4">
        <div className="text-3xl font-black italic tracking-tighter select-none">
          <span className="text-white">HPSSA</span>
          <span className="text-red-600">F1</span>
        </div>
        <div className="hidden md:block h-8 w-px bg-gray-700 mx-2"></div>
        <div className="hidden md:flex flex-col">
          <span className="text-xs text-gray-400 uppercase tracking-widest">System Status</span>
          <span className="text-sm font-bold text-green-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> ONLINE
          </span>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-right hidden sm:block">
          <div className="text-xs text-gray-400 uppercase">Current Session</div>
          <div className="text-lg font-bold text-white uppercase">{currentCircuit ? `${currentCircuit.venue} GP` : 'SELECT CIRCUIT'}</div>
        </div>
        <div className="font-mono text-xl text-red-500 font-bold border border-gray-800 bg-gray-900 px-3 py-1 rounded w-32 text-center">{currentTime}</div>
      </div>
    </header>
  );
}
