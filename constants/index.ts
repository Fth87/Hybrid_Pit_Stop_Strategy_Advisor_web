import { Circuit, Compound } from '@/types';

// --- DATA CONSTANTS ---
export const CIRCUITS: Circuit[] = [
  { country: 'Australia', venue: 'Melbourne', lat: -37.8497, lon: 144.968, type: 'Street', sc_risk: 'High' },
  { country: 'China', venue: 'Shanghai', lat: 31.3389, lon: 121.2215, type: 'Permanent', sc_risk: 'Medium' },
  { country: 'Japan', venue: 'Suzuka', lat: 34.8431, lon: 136.541, type: 'Permanent', sc_risk: 'Medium' },
  { country: 'Bahrain', venue: 'Sakhir', lat: 26.0325, lon: 50.5106, type: 'Permanent', sc_risk: 'Medium' },
  { country: 'Saudi Arabia', venue: 'Jeddah', lat: 21.6319, lon: 39.1044, type: 'Street', sc_risk: 'High' },
  { country: 'USA', venue: 'Miami', lat: 25.958, lon: -80.2389, type: 'Street', sc_risk: 'High' },
  { country: 'Canada', venue: 'Montreal', lat: 45.5, lon: -73.5228, type: 'Street', sc_risk: 'High' },
  { country: 'Monaco', venue: 'Monaco', lat: 43.7347, lon: 7.4205, type: 'Street', sc_risk: 'High' },
  { country: 'Spain', venue: 'Barcelona', lat: 41.57, lon: 2.2611, type: 'Permanent', sc_risk: 'Low' },
  { country: 'Austria', venue: 'Spielberg', lat: 47.2197, lon: 14.7647, type: 'Permanent', sc_risk: 'Medium' },
  { country: 'Great Britain', venue: 'Silverstone', lat: 52.0786, lon: -1.0169, type: 'Permanent', sc_risk: 'Medium' },
  { country: 'Belgium', venue: 'Spa', lat: 50.4372, lon: 5.9714, type: 'Permanent', sc_risk: 'High' },
  { country: 'Hungary', venue: 'Budapest', lat: 47.583, lon: 19.2476, type: 'Permanent', sc_risk: 'Low' },
  { country: 'Netherlands', venue: 'Zandvoort', lat: 52.3888, lon: 4.5409, type: 'Permanent', sc_risk: 'High' },
  { country: 'Italy', venue: 'Monza', lat: 45.6156, lon: 9.2811, type: 'Permanent', sc_risk: 'Medium' },
  { country: 'Azerbaijan', venue: 'Baku', lat: 40.3725, lon: 49.8533, type: 'Street', sc_risk: 'High' },
  { country: 'Singapore', venue: 'Singapore', lat: 1.2914, lon: 103.864, type: 'Street', sc_risk: 'High' },
  { country: 'USA', venue: 'Austin', lat: 30.1328, lon: -97.6411, type: 'Permanent', sc_risk: 'Medium' },
  { country: 'Mexico', venue: 'Mexico City', lat: 19.4042, lon: -99.0907, type: 'Permanent', sc_risk: 'Medium' },
  { country: 'Brazil', venue: 'Sao Paulo', lat: -23.7036, lon: -46.6997, type: 'Permanent', sc_risk: 'Medium' },
  { country: 'USA', venue: 'Las Vegas', lat: 36.1147, lon: -115.1728, type: 'Street', sc_risk: 'High' },
  { country: 'Qatar', venue: 'Lusail', lat: 25.4223, lon: 51.4556, type: 'Permanent', sc_risk: 'Medium' },
  { country: 'Abu Dhabi', venue: 'Yas Marina', lat: 24.4672, lon: 54.6031, type: 'Permanent', sc_risk: 'Medium' },
];

// Mapping value compound sesuai Notebook Cell 1 (COMPOUND_MAP)
export const COMPOUND_MAP: Record<string, number> = {
  HARD: 3,
  MEDIUM: 5,
  SOFT: 7,
  INTER: 9,
  WET: 10,
};

// Strategy Thresholds
export const THRESHOLD_CRITICAL = 7.5;
export const THRESHOLD_STRATEGIC = 4.5;

// Compound Button Data
export const COMPOUND_BUTTONS: { id: Compound; label: string; colorClass: string }[] = [
  { id: 'SOFT', label: 'S', colorClass: 'text-red-500 border-red-500' },
  { id: 'MEDIUM', label: 'M', colorClass: 'text-yellow-400 border-yellow-400' },
  { id: 'HARD', label: 'H', colorClass: 'text-white border-white' },
  { id: 'INTER', label: 'I', colorClass: 'text-green-500 border-green-500' },
  { id: 'WET', label: 'W', colorClass: 'text-blue-500 border-blue-500' },
];
