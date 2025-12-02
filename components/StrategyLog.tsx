import React from 'react';
import { FaTerminal } from 'react-icons/fa6';
import { StrategyLogItem } from '@/types';

interface StrategyLogProps {
  logs: StrategyLogItem[];
}

export function StrategyLog({ logs }: StrategyLogProps) {
  return (
    <div className="glass-panel p-3 overflow-y-auto max-h-40 font-mono text-[10px] text-gray-400">
      <div className="flex items-center gap-2 mb-2 text-gray-500 border-b border-gray-700 pb-1">
        <FaTerminal /> STRATEGY LOG
      </div>
      <div className="flex flex-col gap-1">
        {logs.map((log, idx) => (
          <div key={idx}>
            <span className="text-gray-600">[{log.time}]</span> {log.compound} ({log.laps}L) | <span className={log.styleClass}>{log.decision}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
