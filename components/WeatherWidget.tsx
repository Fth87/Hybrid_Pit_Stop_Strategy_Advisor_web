import React from 'react';
import { FaSync } from 'react-icons/fa';
import { FaCloudShowersHeavy, FaCloudRain, FaCloud, FaSun } from 'react-icons/fa6';
import { WeatherIconType } from '@/types';

interface WeatherWidgetProps {
  weatherStatus: string;
  weatherDesc: string;
  rainProb: string;
  weatherIconType: WeatherIconType;
  onRefresh: () => void;
}

export function WeatherWidget({ weatherStatus, weatherDesc, rainProb, weatherIconType, onRefresh }: WeatherWidgetProps) {
  const renderWeatherIcon = () => {
    switch (weatherIconType) {
      case 'sun':
        return <FaSun className="text-3xl text-yellow-400" />;
      case 'cloud':
        return <FaCloud className="text-3xl text-gray-400" />;
      case 'rain':
        return <FaCloudRain className="text-3xl text-blue-300" />;
      case 'heavy':
        return <FaCloudShowersHeavy className="text-3xl text-blue-500" />;
      default:
        return <FaSun className="text-3xl text-yellow-400" />;
    }
  };

  return (
    <div className="glass-panel p-4 border-l-4 border-blue-500 relative">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xs font-bold text-gray-400 uppercase">Live Weather (Open-Meteo)</h3>
        <button onClick={onRefresh} className="text-xs bg-blue-900 text-blue-300 px-2 py-0.5 rounded border border-blue-700 hover:bg-blue-800 flex items-center gap-1">
          <FaSync className="text-[10px]" /> Refresh
        </button>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {renderWeatherIcon()}
          <div>
            <div className="text-2xl font-black">{weatherStatus}</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider">{weatherDesc}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-gray-400 uppercase">Rain Prob.</div>
          <div className="text-xl font-bold text-blue-400">{rainProb}</div>
        </div>
      </div>
    </div>
  );
}
