'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FaMapLocationDot,
  FaChevronDown,
  FaRoad,
  FaTriangleExclamation,
  FaMicrochip,
  FaArrowRight,
  FaCloudSun,
  FaFlagCheckered,
  FaArrowRightToBracket,
  FaChessKnight,
  FaTerminal,
  FaCloudShowersHeavy,
  FaCloudRain,
  FaCloud,
  FaSun,
  FaCircleCheck,
  FaCircleExclamation,
} from 'react-icons/fa6';
import { FaSync, FaTimes } from 'react-icons/fa';
import clsx from 'clsx';

// IMPORT CUSTOM LOGIC MODULES
import { calculateFuzzyUrgency } from '@/utils/fuzzyLogic';
import { calculateSCRisk } from '@/utils/bayesianNetwork';
import { validateRegulation } from '@/utils/folValidator';

// --- TYPES ---
type TrackType = 'Street' | 'Permanent';
type SCRisk = 'High' | 'Medium' | 'Low';
type Compound = 'SOFT' | 'MEDIUM' | 'HARD' | 'INTER' | 'WET';

interface Circuit {
  country: string;
  venue: string;
  lat: number;
  lon: number;
  type: TrackType;
  sc_risk: SCRisk;
}

interface StrategyLogItem {
  time: string;
  compound: Compound;
  laps: number;
  decision: string;
  styleClass: string;
}

// Mapping value compound sesuai Notebook Cell 1 (COMPOUND_MAP)
const COMPOUND_MAP: Record<string, number> = {
  HARD: 3,
  MEDIUM: 5,
  SOFT: 7,
  INTER: 9,
  WET: 10,
};

// --- DATA CONSTANTS ---
const CIRCUITS: Circuit[] = [
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

const THRESHOLD_CRITICAL = 7.5;
const THRESHOLD_STRATEGIC = 4.5;

export default function F1StrategyInterface() {
  // --- STATES ---
  const [selectedCircuitIdx, setSelectedCircuitIdx] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('--:--');

  // Telemetry Inputs
  const [tireAge, setTireAge] = useState<number>(15);
  const [scActive, setScActive] = useState<boolean>(false);
  const [currentCompound, setCurrentCompound] = useState<Compound>('MEDIUM');
  const [historyList, setHistoryList] = useState<Compound[]>(['SOFT']);

  // Weather State
  const [weatherStatus, setWeatherStatus] = useState<string>('--');
  const [weatherDesc, setWeatherDesc] = useState<string>('Syncing...');
  const [rainProb, setRainProb] = useState<string>('--%');
  const [isRainingGlobal, setIsRainingGlobal] = useState<boolean>(false);
  const [cloudCover, setCloudCover] = useState<number>(10);
  const [weatherIconType, setWeatherIconType] = useState<'sun' | 'cloud' | 'rain' | 'heavy'>('sun');

  // Output States
  const [decision, setDecision] = useState<string>('AWAITING INPUT');
  const [decisionReason, setDecisionReason] = useState<string>('Select circuit and input telemetry to begin.');
  const [decisionClass, setDecisionClass] = useState<string>('text-white');
  const [urgencyScore, setUrgencyScore] = useState<number>(0);
  const [scProb, setScProb] = useState<number>(0);
  const [regStatus, setRegStatus] = useState<string>('No Check');
  const [regIcon, setRegIcon] = useState<{ icon: any; color: string }>({ icon: FaCircleCheck, color: 'text-gray-600' });
  const [logs, setLogs] = useState<StrategyLogItem[]>([]);

  // Loading State
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // --- HELPERS ---
  const currentCircuit = selectedCircuitIdx !== null ? CIRCUITS[selectedCircuitIdx] : null;

  const updateClock = useCallback(() => {
    if (!currentCircuit) {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${h}:${m}`);
    }
  }, [currentCircuit]);

  useEffect(() => {
    updateClock();
    const interval = setInterval(updateClock, 60000);
    return () => clearInterval(interval);
  }, [updateClock]);

  // --- API LOGIC ---
 const fetchWeatherData = async () => {
    if (!currentCircuit) return;
    
    setWeatherDesc("FETCHING API...");
    try {
      const { lat, lon } = currentCircuit;
      // Kita tambahkan parameter precipitation_probability untuk data yang lebih akurat
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&minutely_15=precipitation&current=cloud_cover,precipitation,precipitation_probability&timezone=auto`;
      const response = await fetch(url);
      const data = await response.json();

      // Time
      const localTime = data.current.time || new Date().toISOString();
      setCurrentTime(localTime.split("T")[1]);

      // Weather Data Points
      const cloud = data.current.cloud_cover; // Persentase awan
      const precipProb = data.current.precipitation_probability || 0; // Persentase peluang hujan
      const precipNow = data.current.precipitation; // Curah hujan saat ini (mm)
      
      // Data 15 menit ke depan (jika tersedia)
      const precipForecast = data.minutely_15 ? data.minutely_15.precipitation : [0, 0];
      const rainSoon = precipForecast[1] || 0;

      let raining = false;

      // --- LOGIC PENENTUAN STATUS ---
      
      // 1. Jika curah hujan > 0.1mm -> WET
      if (precipNow > 0.1) {
        raining = true;
        setWeatherStatus("WET");
        setWeatherDesc(`RAIN: ${precipNow}mm`);
        setWeatherIconType("heavy");
        setRainProb("100%"); // Pasti hujan
        
      // 2. Jika 15 menit lagi hujan -> RAIN SOON
      } else if (rainSoon > 0.1) {
        raining = true; // Dianggap wet race untuk strategi
        setWeatherStatus("RAIN SOON");
        setWeatherDesc("PRECIPITATION < 15M");
        setWeatherIconType("rain");
        setRainProb(`${Math.max(precipProb, 80)}%`); // High prob
        
      // 3. Jika awan tebal (>70%) tapi tidak hujan -> OVERCAST
      } else if (cloud > 70) {
        setWeatherStatus("OVERCAST"); // Mendung
        setWeatherDesc(`CLOUD COVER: ${cloud}%`);
        setWeatherIconType("cloud");
        // Tampilkan probabilitas hujan asli dari API, bukan awan
        setRainProb(`${precipProb}%`); 
        
      // 4. Cerah / Berawan sebagian -> DRY
      } else {
        setWeatherStatus("DRY");
        setWeatherDesc(cloud < 30 ? "SUNNY" : "PARTLY CLOUDY");
        setWeatherIconType("sun");
        setRainProb(`${precipProb}%`);
      }

      setCloudCover(cloud);
      setIsRainingGlobal(raining);

    } catch (error) {
      console.error(error);
      setWeatherDesc("API ERROR (DEFAULT)");
      setCloudCover(10);
      setIsRainingGlobal(false);
    }
  };

  useEffect(() => {
    if (currentCircuit) fetchWeatherData();
  }, [currentCircuit]);

  // --- STRATEGY LOGIC CORE ---
  const runAdvisor = () => {
    if (!currentCircuit) {
      alert('Please select a circuit first!');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // 1. Prepare Inputs for Modules
      const { type: trackType, sc_risk: scHist } = currentCircuit;
      const compValue = COMPOUND_MAP[currentCompound] || 5;

      // Determince simplified weather state for Bayesian & FOL
      // Notebook logic: Wet if cloud > 60? Let's match fuzzy logic: Rain if precip > 0.1 OR cloud high enough to trigger 'hujan' rule
      // For simplification, we pass the raw cloud value to fuzzy, and a simple string to Bayesian/FOL
      const weatherStr = isRainingGlobal ? 'WET' : cloudCover > 50 ? 'WET' : 'DRY';

      // --- MODULE 1: FUZZY LOGIC (Urgency) ---
      // Inputs: Tire Age (0-60), Compound Val (3-10), Cloud (0-100)
      // Special case: If it's raining but we use Dry tires, cloudCover passed to Fuzzy should ensure "Hujan" rule fires.
      // If isRainingGlobal is true, we force cloud input to 90 for fuzzy to detect it.
      const fuzzyWeatherInput = isRainingGlobal ? 95 : cloudCover;
      let urgency = calculateFuzzyUrgency(tireAge, compValue, fuzzyWeatherInput);

      // Manual override from notebook: if SC active, urgency jumps
      if (scActive) urgency = Math.min(urgency + 2, 10);

      // --- MODULE 2: BAYESIAN NETWORK (SC Risk) ---
      // Inputs: Track (Street/Perm), Weather (Dry/Wet), Hist (Low/Med/High)
      const prob = calculateSCRisk(trackType, weatherStr, scHist);

      // --- MODULE 3: FOL (Regulation) ---
      // Inputs: History List, Current Compound, Weather
      const { valid: regValid, msg: regMsg, iconType: regIconType } = validateRegulation(historyList, currentCompound, weatherStr);

      // --- MODULE 4: DECISION ENGINE ---
      let dec = 'STAY OUT';
      let rea = 'Pace is optimal';
      let css = 'text-white';

      if (scActive) {
        dec = 'BOX BOX (SC)';
        rea = 'Cheap Pit Stop Window';
        css = 'text-yellow-400 animate-bounce';
      } else if (urgency > THRESHOLD_CRITICAL) {
        // Check FOL
        if (!regValid) {
          dec = 'BOX (CRITICAL*)';
          rea = 'High Wear but Regs Invalid!';
          css = 'text-red-600 animate-pulse';
        } else {
          dec = 'BOX BOX (CRITICAL)';
          rea = 'Tire Life Critical / Wrong Tire';
          css = 'text-red-600 animate-pulse';
        }
      } else if (urgency >= THRESHOLD_STRATEGIC) {
        if (prob > 0.3) {
          dec = 'BOX (STRATEGIC + SC RISK)';
          rea = 'Undercut + High SC Chance';
          css = 'text-orange-500';
        } else {
          dec = 'BOX (STRATEGIC)';
          rea = 'Undercut window open';
          css = 'text-blue-400';
        }
      } else if (prob > 0.6 && urgency > 3) {
        dec = 'BOX (GAMBLE)';
        rea = 'Anticipate Safety Car';
        css = 'text-orange-500';
      }

      // Update UI State
      setDecision(dec);
      setDecisionReason(rea);
      setDecisionClass(css);
      setUrgencyScore(urgency);
      setScProb(prob);
      setRegStatus(regMsg);

      // Set Icon based on FOL result
      if (regIconType === 'rain') setRegIcon({ icon: FaCloudShowersHeavy, color: 'text-blue-400' });
      else if (regIconType === 'warn') setRegIcon({ icon: FaCircleExclamation, color: 'text-yellow-400 animate-pulse' });
      else setRegIcon({ icon: FaCircleCheck, color: 'text-green-500' });

      const newLog: StrategyLogItem = {
        time: new Date().toLocaleTimeString(),
        compound: currentCompound,
        laps: tireAge,
        decision: dec,
        styleClass: css.split(' ')[0],
      };
      setLogs((prev) => [newLog, ...prev]);
      setIsLoading(false);
    }, 500); // Simulate calculation delay
  };

  const getChipStyle = (c: Compound) => {
    switch (c) {
      case 'SOFT':
        return 'text-red-500 border-red-500';
      case 'MEDIUM':
        return 'text-yellow-400 border-yellow-400';
      case 'HARD':
        return 'text-white border-white';
      case 'INTER':
        return 'text-green-500 border-green-500';
      case 'WET':
        return 'text-blue-500 border-blue-500';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative font-[family-name:var(--font-titillium)]">
      {/* HEADER */}
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

      {/* MAIN CONTENT */}
      <main className="flex-grow p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 z-10 relative">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Circuit Configuration */}
          <div className="glass-panel p-5 f1-border-left relative">
            <h2 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
              <FaMapLocationDot className="text-red-600" /> Circuit Configuration
            </h2>

            <div className="mb-4 relative">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 block">Grand Prix Venue</label>
              <div className="relative">
                <select className="f1-input-base w-full p-2 rounded font-mono text-sm appearance-none cursor-pointer" onChange={(e) => setSelectedCircuitIdx(Number(e.target.value))} value={selectedCircuitIdx ?? ''}>
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

          {/* Telemetry */}
          <div className="glass-panel p-5 f1-border-left relative">
            <h2 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
              <FaMicrochip className="text-red-600" /> Telemetry & Tire Data
            </h2>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 block">Tire Age</label>
                <input type="number" min="0" max="80" value={tireAge} onChange={(e) => setTireAge(Number(e.target.value))} className="f1-input-base w-full p-2 rounded font-mono text-center font-bold" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 block">SC Status</label>
                <label className="flex items-center gap-2 cursor-pointer h-10 bg-gray-900/50 rounded px-2 border border-gray-700 hover:border-gray-500 transition-colors">
                  <input type="checkbox" checked={scActive} onChange={(e) => setScActive(e.target.checked)} className="w-4 h-4 text-yellow-400 rounded focus:ring-0 bg-gray-800 border-gray-600 accent-yellow-400" />
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
                      <FaTimes className="ml-2 cursor-pointer hover:text-white" onClick={() => setHistoryList((prev) => prev.filter((_, i) => i !== idx))} />
                    </div>
                  ))
                )}
              </div>

              <div className="flex gap-2 justify-between items-center bg-gray-800 p-2 rounded border border-gray-700">
                <span className="text-[10px] text-gray-400 uppercase font-bold mr-2">ADD STINT:</span>
                <div className="flex gap-2">
                  {[
                    { l: 'S', c: 'SOFT', col: 'text-red-500 border-red-500' },
                    { l: 'M', c: 'MEDIUM', col: 'text-yellow-400 border-yellow-400' },
                    { l: 'H', c: 'HARD', col: 'text-white border-white' },
                    { l: 'I', c: 'INTER', col: 'text-green-500 border-green-500' },
                    { l: 'W', c: 'WET', col: 'text-blue-500 border-blue-500' },
                  ].map((btn) => (
                    <button
                      key={btn.c}
                      onClick={() => setHistoryList([...historyList, btn.c as Compound])}
                      className={`w-7 h-7 rounded-full text-[10px] font-bold flex items-center justify-center border-2 hover:opacity-80 active:scale-90 transition ${btn.col}`}
                    >
                      {btn.l}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Compound Selector */}
            <div className="mb-4 text-center">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 block">Current Compound</label>
              <div className="flex justify-center gap-3 mt-2">
                {[
                  { id: 'SOFT', l: 'S', col: 'border-red-500 text-red-500' },
                  { id: 'MEDIUM', l: 'M', col: 'border-yellow-400 text-yellow-400' },
                  { id: 'HARD', l: 'H', col: 'border-white text-white' },
                  { id: 'INTER', l: 'I', col: 'border-green-500 text-green-500' },
                  { id: 'WET', l: 'W', col: 'border-blue-500 text-blue-500' },
                ].map((item) => (
                  <div key={item.id} className="relative">
                    <input
                      type="radio"
                      name="compound"
                      id={item.id}
                      value={item.id}
                      checked={currentCompound === item.id}
                      onChange={() => setCurrentCompound(item.id as Compound)}
                      className="absolute opacity-0 w-full h-full cursor-pointer z-10"
                    />
                    <div
                      className={clsx(
                        'w-10 h-10 rounded-full border-4 bg-gray-900 flex items-center justify-center font-bold text-xs transition-transform duration-200',
                        item.col,
                        currentCompound === item.id ? 'scale-110 opacity-100 ring-2 ring-white ring-opacity-20' : 'opacity-50 scale-90'
                      )}
                    >
                      {item.l}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={runAdvisor}
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

          {/* Weather Widget */}
          <div className="glass-panel p-4 border-l-4 border-blue-500 relative">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xs font-bold text-gray-400 uppercase">Live Weather (Open-Meteo)</h3>
              <button onClick={fetchWeatherData} className="text-xs bg-blue-900 text-blue-300 px-2 py-0.5 rounded border border-blue-700 hover:bg-blue-800 flex items-center gap-1">
                <FaSync className="text-[10px]" /> Refresh
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {weatherIconType === 'sun' && <FaSun className="text-3xl text-yellow-400" />}
                {weatherIconType === 'cloud' && <FaCloud className="text-3xl text-gray-400" />}
                {weatherIconType === 'rain' && <FaCloudRain className="text-3xl text-blue-300" />}
                {weatherIconType === 'heavy' && <FaCloudShowersHeavy className="text-3xl text-blue-500" />}
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
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Main Decision Output */}
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

          {/* Analysis Modules */}
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
                <span className={clsx('h-3 w-3 rounded-full bg-gray-700 transition-all', { 'bg-yellow-400 shadow-[0_0_8px_#ffeb3b] animate-pulse': scProb <= 0.3 })}></span>
                <span className={clsx('h-3 w-3 rounded-full bg-gray-700 transition-all', { 'bg-yellow-400 shadow-[0_0_8px_#ffeb3b] animate-pulse': scProb > 0.3 && scProb <= 0.6 })}></span>
                <span className={clsx('h-3 w-3 rounded-full bg-gray-700 transition-all', { 'bg-yellow-400 shadow-[0_0_8px_#ffeb3b] animate-pulse': scProb > 0.6 })}></span>
              </div>
            </div>

            {/* Module 3: Regulation (FOL Output) */}
            <div className="glass-panel p-4 border-t-2 border-purple-500">
              <div className="flex justify-between items-end mb-2">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase">Regulation (FOL)</h4>
                <regIcon.icon className={`text-xl ${regIcon.color}`} />
              </div>
              <div className={`text-xs font-bold ${regIcon.color.replace('animate-pulse', '')}`}>{regStatus}</div>
            </div>
          </div>

          {/* Log */}
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
        </div>
      </main>
    </div>
  );
}
