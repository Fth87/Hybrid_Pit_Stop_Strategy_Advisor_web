'use client';

import React, { useState, useCallback } from 'react';
import { Compound, StrategyLogItem } from '@/types';
import { CIRCUITS, COMPOUND_MAP, THRESHOLD_CRITICAL, THRESHOLD_STRATEGIC } from '@/constants';
import { useClock, useWeather } from '@/hooks';
import {
  Header,
  CircuitConfiguration,
  TelemetryPanel,
  WeatherWidget,
  StrategyDecision,
  AnalysisModules,
  StrategyLog,
} from '@/components';

// Import custom logic modules
import { calculateFuzzyUrgency } from '@/utils/fuzzyLogic';
import { calculateSCRisk } from '@/utils/bayesianNetwork';
import { validateRegulation } from '@/utils/folValidator';

export default function F1StrategyInterface() {
  // --- STATES ---
  const [selectedCircuitIdx, setSelectedCircuitIdx] = useState<number | null>(null);

  // Telemetry Inputs
  const [tireAge, setTireAge] = useState<number>(15);
  const [scActive, setScActive] = useState<boolean>(false);
  const [currentCompound, setCurrentCompound] = useState<Compound>('MEDIUM');
  const [historyList, setHistoryList] = useState<Compound[]>(['SOFT']);

  // Output States
  const [decision, setDecision] = useState<string>('AWAITING INPUT');
  const [decisionReason, setDecisionReason] = useState<string>('Select circuit and input telemetry to begin.');
  const [decisionClass, setDecisionClass] = useState<string>('text-white');
  const [urgencyScore, setUrgencyScore] = useState<number>(0);
  const [scProb, setScProb] = useState<number>(0);
  const [regStatus, setRegStatus] = useState<string>('No Check');
  const [regIconType, setRegIconType] = useState<'check' | 'warn' | 'rain'>('check');
  const [logs, setLogs] = useState<StrategyLogItem[]>([]);

  // Loading State
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // --- HELPERS ---
  const currentCircuit = selectedCircuitIdx !== null ? CIRCUITS[selectedCircuitIdx] : null;

  // Custom Hooks
  const { currentTime, setCurrentTime } = useClock(!currentCircuit);
  const { weather, fetchWeatherData } = useWeather(currentCircuit);

  // Update time when weather is fetched
  const handleWeatherRefresh = useCallback(() => {
    fetchWeatherData();
  }, [fetchWeatherData]);

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

      // Determine simplified weather state for Bayesian & FOL
      const weatherStr = weather.isRaining ? 'WET' : weather.cloudCover > 50 ? 'WET' : 'DRY';

      // --- MODULE 1: FUZZY LOGIC (Urgency) ---
      const fuzzyWeatherInput = weather.isRaining ? 95 : weather.cloudCover;
      let urgency = calculateFuzzyUrgency(tireAge, compValue, fuzzyWeatherInput);

      // Manual override from notebook: if SC active, urgency jumps
      if (scActive) urgency = Math.min(urgency + 2, 10);

      // --- MODULE 2: BAYESIAN NETWORK (SC Risk) ---
      const prob = calculateSCRisk(trackType, weatherStr, scHist);

      // --- MODULE 3: FOL (Regulation) ---
      const { valid: regValid, msg: regMsg, iconType: folIconType } = validateRegulation(historyList, currentCompound, weatherStr);

      // --- MODULE 4: DECISION ENGINE ---
      let dec = 'STAY OUT';
      let rea = 'Pace is optimal';
      let css = 'text-white';

      if (scActive) {
        dec = 'BOX BOX (SC)';
        rea = 'Cheap Pit Stop Window';
        css = 'text-yellow-400 animate-bounce';
      } else if (urgency > THRESHOLD_CRITICAL) {
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
      setRegIconType(folIconType);

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

  return (
    <div className="min-h-screen flex flex-col relative font-[family-name:var(--font-titillium)]">
      {/* HEADER */}
      <Header currentCircuit={currentCircuit} currentTime={currentTime} />

      {/* MAIN CONTENT */}
      <main className="flex-grow p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 z-10 relative">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Circuit Configuration */}
          <CircuitConfiguration
            selectedCircuitIdx={selectedCircuitIdx}
            onCircuitChange={setSelectedCircuitIdx}
            currentCircuit={currentCircuit}
          />

          {/* Telemetry */}
          <TelemetryPanel
            tireAge={tireAge}
            onTireAgeChange={setTireAge}
            scActive={scActive}
            onScActiveChange={setScActive}
            historyList={historyList}
            onHistoryListChange={setHistoryList}
            currentCompound={currentCompound}
            onCompoundChange={setCurrentCompound}
            onAnalyze={runAdvisor}
            isLoading={isLoading}
          />

          {/* Weather Widget */}
          <WeatherWidget
            weatherStatus={weather.status}
            weatherDesc={weather.desc}
            rainProb={weather.rainProb}
            weatherIconType={weather.iconType}
            onRefresh={handleWeatherRefresh}
          />
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Main Decision Output */}
          <StrategyDecision decision={decision} decisionReason={decisionReason} decisionClass={decisionClass} />

          {/* Analysis Modules */}
          <AnalysisModules urgencyScore={urgencyScore} scProb={scProb} regStatus={regStatus} regIconType={regIconType} />

          {/* Log */}
          <StrategyLog logs={logs} />
        </div>
      </main>
    </div>
  );
}
